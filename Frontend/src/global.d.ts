export {};

declare global {
  interface Window {
    activeConversationId: string | null;
  }
}
