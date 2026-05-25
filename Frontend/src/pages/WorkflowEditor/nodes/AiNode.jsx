import { Handle, Position, useReactFlow } from '@xyflow/react';
import { FiCpu, FiLoader, FiSend, FiX } from 'react-icons/fi';
import { useEffect, useMemo, useRef, useState } from 'react';

const OLLAMA_CHAT_URL = 'http://localhost:11434/api/chat';
const ALLOWED_INPUT_NODE_TYPES = new Set(['note', 'agent', 'terminal']);

const makeMessageId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const extractConnectedNodeContent = (node) => {
  if (!node || !ALLOWED_INPUT_NODE_TYPES.has(node.type)) {
    return '';
  }

  if (node.type === 'note') {
    return String(node.data.text || node.data.prompt || node.data.content || '').trim();
  }

  if (node.type === 'agent') {
    const logContent = Array.isArray(node.data.logs)
      ? node.data.logs
          .map((log) => log?.message)
          .filter(Boolean)
          .join('\n')
      : '';

    return String(
      node.data.objective ||
      node.data.prompt ||
      node.data.label ||
      logContent ||
      node.data.status ||
      '',
    ).trim();
  }

  if (node.type === 'terminal') {
    const terminalOutput = Array.isArray(node.data.outputLines)
      ? node.data.outputLines.join('\n')
      : '';

    return String(
      node.data.output ||
      terminalOutput ||
      node.data.initialCommand ||
      node.data.command ||
      '',
    ).trim();
  }

  return '';
};

const normalizeMessages = (messages) => {
  if (!Array.isArray(messages)) return [];

  return messages
    .map((message) => {
      if (!message || typeof message !== 'object') return null;

      return {
        id: message.id || makeMessageId(),
        role: message.role === 'assistant' ? 'assistant' : 'user',
        content: String(message.content || '').trim(),
        source: message.source || '',
      };
    })
    .filter((message) => message && message.content);
};

const AiNode = ({ id, data, selected }) => {
  const { getNodes, getEdges } = useReactFlow();
  const [isLoading, setIsLoading] = useState(false);
  const [draft, setDraft] = useState(data.draft ?? data.prompt ?? '');
  const [messages, setMessages] = useState(() => normalizeMessages(data.messages));
  const scrollRef = useRef(null);

  const activeUsers = Object.values(data.activeUsers || {});
  const showPresence = activeUsers.length > 0;

  useEffect(() => {
    setMessages(normalizeMessages(data.messages));
  }, [data.messages]);

  useEffect(() => {
    setDraft(data.draft ?? data.prompt ?? '');
  }, [data.draft, data.prompt]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const incomingMessages = useMemo(() => {
    const nodes = getNodes();
    const edges = getEdges();
    const incomingEdges = edges.filter((edge) => edge.target === id);

    return incomingEdges
      .map((edge) => nodes.find((node) => node.id === edge.source))
      .filter((node) => node && ALLOWED_INPUT_NODE_TYPES.has(node.type))
      .flatMap((node, index) => {
        const label = node.data.label || node.type || 'Connected Node';
        const content = extractConnectedNodeContent(node);

        if (!content) {
          return [];
        }

        return [{
          id: `${node.id}-${index}-${makeMessageId()}`,
          role: 'user',
          content,
          source: label,
        }];
      });
  }, [getEdges, getNodes, id]);

  const persistMessages = (nextMessages, extraData = {}) => {
    const cleanedMessages = normalizeMessages(nextMessages);
    setMessages(cleanedMessages);

    if (data.onDataChange) {
      data.onDataChange({
        messages: cleanedMessages,
        draft: extraData.draft ?? draft,
        prompt: extraData.draft ?? draft,
        ...extraData,
      });
    }
  };

  const handleAsk = async () => {
    const typedDraft = draft.trim();
    const connectedDrafts = incomingMessages.map((message) => message.content);
    const hasConnectedInput = connectedDrafts.length > 0;

    if (!typedDraft && !hasConnectedInput) {
      return;
    }

    const connectedContent = connectedDrafts.join('\n');
    const userContent = [connectedContent, typedDraft].filter(Boolean).join('\n\n');
    const userMessage = {
      id: makeMessageId(),
      role: 'user',
      content: userContent,
      source: typedDraft ? 'You' : 'Connected nodes',
    };
    const nextMessages = [...messages, userMessage];

    persistMessages(nextMessages, { draft: '' });
    setDraft('');
    setIsLoading(true);

    try {
      const response = await fetch(OLLAMA_CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'qwen3:0.6b',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful AI assistant inside a workflow editor. Keep replies concise, clear, and useful.',
            },
            ...nextMessages.map((message) => ({
              role: message.role,
              content: message.source ? `[${message.source}] ${message.content}` : message.content,
            })),
          ],
          stream: false,
        }),
      });

      const json = await response.json();
      const assistantText = String(json.message?.content || json.response || '').trim();
      const assistantMessage = {
        id: makeMessageId(),
        role: 'assistant',
        content: assistantText || 'No response returned from Ollama.',
        source: 'AI Assistant',
      };

      persistMessages([...nextMessages, assistantMessage]);
    } catch (err) {
      console.error('Error calling Ollama:', err);
      persistMessages([
        ...nextMessages,
        {
          id: makeMessageId(),
          role: 'assistant',
          content: 'Error: Could not connect to AI assistant. Is Ollama running?',
          source: 'AI Assistant',
        },
      ], { draft: '' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDraftKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleAsk();
    }
  };

  return (
    <div className={`bg-[#0b0f19] border rounded-lg w-[320px] font-mono text-sm transition-all relative ${selected || showPresence ? 'border-[#00ff88] shadow-[0_0_20px_rgba(0,255,136,0.6)]' : 'border-[#00ff88]/50 shadow-[0_0_10px_rgba(0,255,136,0.3)]'}`}>
      {showPresence && (
        <div className="absolute -top-6 right-0 flex -space-x-2">
          {activeUsers.map((u, i) => (
            <div
              key={i}
              className="w-5 h-5 rounded-full border-2 border-[#0b0f19] flex items-center justify-center text-[10px] font-bold text-white shadow-lg animate-bounce"
              style={{ backgroundColor: u.color || '#00ff88' }}
              title={u.user}
            >
              {u.user?.[0] || 'U'}
            </div>
          ))}
        </div>
      )}

      <div className="p-2 flex justify-between items-center text-[#00ff88] border-b border-[#00ff88]/30">
        <div className="flex items-center gap-2">
          <FiCpu size={16} />
          <span className="font-bold text-xs uppercase tracking-tighter">AI Assistant</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            className="bg-transparent border-none text-right focus:outline-none text-gray-500 text-xs placeholder-gray-700 w-[100px]"
            placeholder="Task name..."
            defaultValue={data.label || ''}
            onBlur={(e) => data.onTitleChange && data.onTitleChange(e.target.value)}
          />
          <button
            className="text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
            onClick={() => data.onDelete && data.onDelete()}
          >
            <FiX size={14} />
          </button>
        </div>
      </div>

      <div className="p-3 space-y-3">
        <div ref={scrollRef} className="bg-black/60 border border-gray-800 rounded-lg p-2 max-h-72 overflow-y-auto space-y-2">
          {messages.length === 0 ? (
            <div className="text-gray-600 text-xs leading-relaxed">
              Chat history will appear here. Connect upstream nodes or type a message below.
            </div>
          ) : (
            messages.map((message) => {
              const isAssistant = message.role === 'assistant';

              return (
                <div key={message.id} className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${isAssistant ? 'bg-[#10251d] text-[#d9ffe8] border border-[#00ff88]/30' : 'bg-[#1a1f2c] text-gray-100 border border-gray-700'}`}>
                    <div className="mb-1 text-[10px] uppercase tracking-[0.2em] text-gray-500">
                      {message.source || (isAssistant ? 'AI Assistant' : 'You')}
                    </div>
                    {message.content}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="space-y-2 border-t border-[#00ff88]/10 pt-3">
          <textarea
            className="w-full min-h-24 bg-black border border-gray-800 text-gray-300 p-3 rounded-lg resize-none focus:outline-none focus:border-[#00ff88]/50"
            placeholder={incomingMessages.length > 0 ? 'Type a reply or ask follow-up...' : 'Ask something...'}
            value={draft}
            onChange={(e) => {
              const nextDraft = e.target.value;
              setDraft(nextDraft);
              data.onDataChange && data.onDataChange({ draft: nextDraft, prompt: nextDraft });
            }}
            onKeyDown={handleDraftKeyDown}
          />

          <div className="flex items-center justify-between gap-2">
            <div className="text-[10px] text-gray-500 leading-tight">
              Connected nodes are included as user input when you send.
            </div>
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-[#00ff88]/50 px-3 py-2 text-[#00ff88] hover:bg-[#00ff88]/10 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleAsk}
              disabled={isLoading}
              title="Send to Ollama"
            >
              {isLoading ? <FiLoader className="animate-spin" /> : <FiSend size={14} />}
              <span className="text-xs font-medium">Send</span>
            </button>
          </div>
        </div>
      </div>

      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-[#00ff88] border-2 border-[#0b0f19]" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-[#00ff88] border-2 border-[#0b0f19]" />
      <Handle type="target" position={Position.Top} id="top" className="w-3 h-3 bg-[#00ff88] border-2 border-[#0b0f19]" />
    </div>
  );
};

export default AiNode;
