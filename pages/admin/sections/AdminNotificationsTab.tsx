import React from 'react';
import { Send } from 'lucide-react';

interface AdminNotificationsTabProps {
  recipientType: 'all' | 'selected' | 'custom';
  onRecipientTypeChange: (value: 'all' | 'selected' | 'custom') => void;
  subject: string;
  onSubjectChange: (value: string) => void;
  title: string;
  onTitleChange: (value: string) => void;
  body: string;
  onBodyChange: (value: string) => void;
  ctaUrl: string;
  onCtaUrlChange: (value: string) => void;
  ctaLabel: string;
  onCtaLabelChange: (value: string) => void;
  footerNote: string;
  onFooterNoteChange: (value: string) => void;
  selectedUsers: string[];
  onSelectedUsersChange: (value: string[]) => void;
  customEmails: string;
  onCustomEmailsChange: (value: string) => void;
  userSearch: string;
  onUserSearchChange: (value: string) => void;
  users: any[];
  onSend: () => void;
  isSending: boolean;
}

const AdminNotificationsTab: React.FC<AdminNotificationsTabProps> = ({
  recipientType,
  onRecipientTypeChange,
  subject,
  onSubjectChange,
  title,
  onTitleChange,
  body,
  onBodyChange,
  ctaUrl,
  onCtaUrlChange,
  ctaLabel,
  onCtaLabelChange,
  footerNote,
  onFooterNoteChange,
  selectedUsers,
  onSelectedUsersChange,
  customEmails,
  onCustomEmailsChange,
  userSearch,
  onUserSearchChange,
  users,
  onSend,
  isSending
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Recipient Targeting</h3>
            <p className="text-xs text-slate-500 font-medium">Choose who should receive the message.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {['all', 'selected', 'custom'].map((type) => (
            <button
              key={type}
              onClick={() => onRecipientTypeChange(type as any)}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase ${recipientType === type ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              {type}
            </button>
          ))}
        </div>

        {recipientType === 'selected' && (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Search users..."
              value={userSearch}
              onChange={(e) => onUserSearchChange(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2 text-sm font-medium focus:border-teal-500 focus:ring-0"
            />
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {users.map((u) => {
                const checked = selectedUsers.includes(u.id);
                return (
                  <label key={u.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-white hover:border-teal-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        onSelectedUsersChange(
                          e.target.checked
                            ? [...selectedUsers, u.id]
                            : selectedUsers.filter((id) => id !== u.id)
                        );
                      }}
                      className="accent-teal-600"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800">{u.fullName}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                  </label>
                );
              })}
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Selected: {selectedUsers.length}</p>
          </div>
        )}

        {recipientType === 'custom' && (
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400">Custom Emails</label>
            <textarea
              className="w-full min-h-[120px] bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2 text-xs font-medium focus:border-teal-500 focus:ring-0"
              placeholder="Add emails separated by commas or new lines"
              value={customEmails}
              onChange={(e) => onCustomEmailsChange(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
        <div>
          <h3 className="text-lg font-black text-slate-900">Message Content</h3>
          <p className="text-xs text-slate-500 font-medium">Craft a clear, professional email.</p>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400">Subject</label>
          <input
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2 text-sm font-medium focus:border-teal-500 focus:ring-0"
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            placeholder="Announcement from SeeqMe"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400">Title</label>
          <input
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2 text-sm font-medium focus:border-teal-500 focus:ring-0"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Product Update"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400">Message Body</label>
          <textarea
            className="w-full min-h-[160px] bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2 text-xs font-medium focus:border-teal-500 focus:ring-0"
            value={body}
            onChange={(e) => onBodyChange(e.target.value)}
            placeholder="Write the announcement message..."
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400">CTA Label</label>
            <input
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2 text-sm font-medium focus:border-teal-500 focus:ring-0"
              value={ctaLabel}
              onChange={(e) => onCtaLabelChange(e.target.value)}
              placeholder="Open SeeqMe"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400">CTA URL</label>
            <input
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2 text-sm font-medium focus:border-teal-500 focus:ring-0"
              value={ctaUrl}
              onChange={(e) => onCtaUrlChange(e.target.value)}
              placeholder="https://seeqme.com"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400">Footer Note (Optional)</label>
          <input
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2 text-sm font-medium focus:border-teal-500 focus:ring-0"
            value={footerNote}
            onChange={(e) => onFooterNoteChange(e.target.value)}
            placeholder="Need help? Reply to this email."
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={onSend}
            disabled={isSending}
            className="bg-teal-600 text-white text-xs font-black px-5 py-2.5 rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-60"
          >
            {isSending ? 'Sending...' : 'Send Notification'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationsTab;
