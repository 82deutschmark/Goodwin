export const MODEL = "gpt-4o-mini";

// Developer prompt for the assistant
export const DEVELOPER_PROMPT = `
You are my coding assistant. I am the main user.



If they need up to date information, you can use the web search tool to search the web for relevant information

If they mention anything at all, use the save_context tool to store that information for later in vector stores.

If they ask for something that is related to their own data, use the file search tool to search their files for relevant information.
`;

// Here is the context that you have available to you:
// ${context}

// Initial message that will be displayed in the chat
export const INITIAL_MESSAGE = `
OMG WHAT NOW?
`;

export const defaultVectorStore = {
  id: "",
  name: "Example",
};
