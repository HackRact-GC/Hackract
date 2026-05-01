const NODE_TYPE_LABELS = {
  startingPoint: 'Starting Point',
  note: 'Note',
  ai: 'AI',
  agent: 'AI Agent',
  terminal: 'Terminal',
};

export function buildActionMessage(action, details = {}) {
  const nodeLabel = details.label || details.type
    ? `a ${NODE_TYPE_LABELS[details.type] || details.type} node`
    : 'a node';

  const messages = {
    ADD_NODE:       `Added ${nodeLabel}`,
    DELETE_NODE:    `Deleted ${nodeLabel}`,
    MOVE_NODE:      `Moved ${nodeLabel}`,
    UPDATE_TITLE:   `Renamed node to "${details.newTitle || 'Untitled'}"`,
    CONNECT_NODES:  `Connected two nodes`,
    DELETE_EDGE:    `Removed a connection`,
    LINK_FINDING:   `Linked finding to ${nodeLabel}`,
    GRAPH_CHANGED:  `Updated the canvas`,
    AGENT_RAN:      `Ran the "${details.agentName || 'AI'}" agent`,
    TERMINAL_EXEC:  `Executed command in Terminal`,
  };

  return messages[action] || action.replace(/_/g, ' ').toLowerCase();
}
