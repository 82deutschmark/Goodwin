import { MODEL } from "@/config/constants";
import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: Request) {
  try {
    const { messages, tools } = await request.json();
    console.log("Received messages:", messages);

    const openai = new OpenAI();

    // Convert messages format from responses API to chat completions API
    const chatMessages = messages.map((msg: any) => {
      if (msg.role === "developer") {
        return { role: "system", content: msg.content };
      }
      if (msg.role === "user") {
        return { role: "user", content: msg.content[0]?.text || msg.content };
      }
      if (msg.role === "assistant") {
        return { role: "assistant", content: msg.content[0]?.text || msg.content };
      }
      if (msg.type === "function_call_output") {
        return {
          role: "tool",
          content: msg.output,
          tool_call_id: msg.call_id
        };
      }
      return msg;
    });

    // Use standard Chat Completions API with streaming
    const stream = await openai.chat.completions.create({
      model: MODEL,
      messages: chatMessages,
      tools: tools?.map((tool: any) => ({
        type: "function",
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters
        }
      })) || [],
      stream: true,
      temperature: 0.7,
    });

    // Create a ReadableStream that converts OpenAI stream to our expected format
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          let currentToolCall: any = null;
          let currentToolCallArgs = "";
          const messageId = `msg_${Date.now()}`;
          
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta;
            
            if (delta?.content) {
              // Text content event
              const data = JSON.stringify({
                event: "response.output_text.delta",
                data: {
                  delta: delta.content,
                  item_id: messageId,
                },
              });
              controller.enqueue(`data: ${data}\n\n`);
            }
            
            if (delta?.tool_calls) {
              // Tool call events
              for (const toolCall of delta.tool_calls) {
                const toolCallId = toolCall.id || currentToolCall?.id || `call_${Date.now()}_${toolCall.index}`;
                
                // If this is a new tool call
                if (toolCall.function?.name && !currentToolCall) {
                  currentToolCall = {
                    id: toolCallId,
                    name: toolCall.function.name,
                    arguments: toolCall.function.arguments || ""
                  };
                  currentToolCallArgs = toolCall.function.arguments || "";
                  
                  // Send tool call added event
                  const data = JSON.stringify({
                    event: "response.output_item.added",
                    data: {
                      item: {
                        type: "function_call",
                        id: toolCallId,
                        name: toolCall.function.name,
                        arguments: currentToolCallArgs,
                      },
                    },
                  });
                  controller.enqueue(`data: ${data}\n\n`);
                }
                
                // If we're getting more arguments for an existing tool call
                if (toolCall.function?.arguments && currentToolCall) {
                  currentToolCallArgs += toolCall.function.arguments;
                  currentToolCall.arguments = currentToolCallArgs;
                  
                  // Send arguments delta event
                  const data = JSON.stringify({
                    event: "response.function_call_arguments.delta",
                    data: {
                      delta: toolCall.function.arguments,
                      item_id: currentToolCall.id,
                    },
                  });
                  controller.enqueue(`data: ${data}\n\n`);
                }
              }
            }
            
            // Handle completion
            if (chunk.choices[0]?.finish_reason) {
              if (chunk.choices[0].finish_reason === "tool_calls" && currentToolCall) {
                // Send arguments done event
                const argsData = JSON.stringify({
                  event: "response.function_call_arguments.done",
                  data: {
                    item_id: currentToolCall.id,
                    arguments: currentToolCall.arguments,
                  },
                });
                controller.enqueue(`data: ${argsData}\n\n`);
                
                // Send tool call done event
                const doneData = JSON.stringify({
                  event: "response.output_item.done",
                  data: {
                    item: {
                      type: "function_call",
                      id: currentToolCall.id,
                      call_id: currentToolCall.id,
                      name: currentToolCall.name,
                      arguments: currentToolCall.arguments,
                    },
                  },
                });
                controller.enqueue(`data: ${doneData}\n\n`);
              }
              
              // Send response done event
              const data = JSON.stringify({
                event: "response.done",
                data: {},
              });
              controller.enqueue(`data: ${data}\n\n`);
            }
          }
          
          controller.close();
        } catch (error) {
          console.error("Error in streaming loop:", error);
          controller.error(error);
        }
      },
    });

    // Return the ReadableStream as SSE
    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in POST handler:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
