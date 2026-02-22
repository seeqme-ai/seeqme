import React from 'react';
import { MessageCircle, Send, Paperclip, Loader2, Trash2 } from 'lucide-react';

interface AdminChatsTabProps {
  chatSummaries: any[];
  selectedChat: string | null;
  onSelectChat: (id: string) => void;
  chatMessages: any[];
  replyMessage: string;
  onReplyMessageChange: (value: string) => void;
  onSendReply: (e?: React.FormEvent) => void;
  isSending: boolean;
  mobileChatView: 'list' | 'chat';
  onMobileViewChange: (view: 'list' | 'chat') => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onDeleteChat: () => void;
}

const AdminChatsTab: React.FC<AdminChatsTabProps> = ({
  chatSummaries,
  selectedChat,
  onSelectChat,
  chatMessages,
  replyMessage,
  onReplyMessageChange,
  onSendReply,
  isSending,
  mobileChatView,
  onMobileViewChange,
  messagesEndRef,
  onDeleteChat
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-6">
      {/* Chat list */}
      <div className={`bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-2 ${mobileChatView === 'chat' ? 'hidden lg:block' : ''}`}>
        {chatSummaries.map((summary) => (
          <button
            key={summary.userId}
            onClick={() => {
              onSelectChat(summary.userId);
              onMobileViewChange('chat');
            }}
            className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedChat === summary.userId ? 'border-teal-500 bg-teal-50' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-sm text-slate-900">{summary.userName || 'User'}</p>
                <p className="text-xs text-slate-500 line-clamp-1">{summary.lastMessage}</p>
              </div>
              {summary.unreadCount > 0 && (
                <span className="text-[10px] font-black bg-rose-500 text-white px-2 py-1 rounded-full">
                  {summary.unreadCount}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Chat window */}
      <div className={`bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col ${mobileChatView === 'list' ? 'hidden lg:flex' : ''}`}>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-800">Support Chat</h3>
          </div>
          <div className="flex items-center gap-3">
            {selectedChat && (
              <button
                type="button"
                onClick={onDeleteChat}
                className="text-rose-500 text-xs font-bold flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            )}
            <button onClick={() => onMobileViewChange('list')} className="lg:hidden text-xs font-bold text-slate-400">
              Back
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {chatMessages.map((msg) => (
            <div key={msg.id} className={`max-w-[80%] ${msg.isAdmin ? 'ml-auto text-right' : ''}`}>
              <div className={`inline-block px-4 py-2 rounded-2xl text-sm ${msg.isAdmin ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                {msg.text}
              </div>
              {msg.fileUrl && (
                <a href={msg.fileUrl} target="_blank" className="block mt-2 text-[10px] font-bold text-teal-600">
                  {msg.fileName || 'Attachment'}
                </a>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
          {chatMessages.length === 0 && (
            <div className="flex flex-col items-center text-center py-16 text-slate-400">
              <MessageCircle className="w-14 h-14 mb-4 text-slate-300" />
              <h3 className="text-lg font-bold text-slate-800">Select a conversation</h3>
              <p className="text-sm font-medium text-slate-500">Click on a user chat to start responding in real-time</p>
            </div>
          )}
        </div>

        <form onSubmit={onSendReply} className="p-5 border-t border-slate-100 flex gap-3">
          <div className="relative flex-1">
            <input
              value={replyMessage}
              onChange={(e) => onReplyMessageChange(e.target.value)}
              placeholder="Type your reply..."
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-medium focus:border-teal-500 focus:ring-0"
            />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Paperclip className="w-4 h-4" />
            </button>
          </div>
          <button
            type="submit"
            disabled={isSending}
            className="bg-teal-600 text-white px-4 rounded-2xl font-bold text-sm hover:bg-teal-700 disabled:opacity-60 flex items-center justify-center"
          >
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminChatsTab;
