import React from 'react';
import { Settings, Loader } from 'lucide-react';

interface AdminConfigTabProps {
  systemConfig: any;
  setSystemConfig: React.Dispatch<React.SetStateAction<any>>;
  isConfigLoading: boolean;
  isConfigSaving: boolean;
  isDirty: boolean;
  onSave: () => void;
  defaultPlans: any[];
}

const AdminConfigTab: React.FC<AdminConfigTabProps> = ({
  systemConfig,
  setSystemConfig,
  isConfigLoading,
  isConfigSaving,
  isDirty,
  onSave,
  defaultPlans
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">System Configuration</h3>
            <p className="text-xs text-slate-500 font-medium">Pricing, access, and runtime settings</p>
          </div>
        </div>
        {isDirty && (
          <button
            onClick={onSave}
            className="bg-teal-600 text-white text-xs font-black px-4 py-2.5 rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-60"
            disabled={isConfigSaving || isConfigLoading}
          >
            {isConfigSaving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      {isConfigLoading && (
        <div className="py-16 flex items-center justify-center">
          <Loader className="text-teal-600 animate-spin" />
        </div>
      )}

      {!isConfigLoading && systemConfig && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
              <label className="text-[10px] font-black uppercase text-slate-400">Maintenance Mode</label>
              <div className="mt-3">
                <button
                  onClick={() => setSystemConfig((prev: any) => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))}
                  className={`w-full py-2 rounded-xl text-xs font-black uppercase ${systemConfig.maintenanceMode ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-700'}`}
                >
                  {systemConfig.maintenanceMode ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
              <label className="text-[10px] font-black uppercase text-slate-400">Allow Signups</label>
              <div className="mt-3">
                <button
                  onClick={() => setSystemConfig((prev: any) => ({ ...prev, allowSignups: !prev.allowSignups }))}
                  className={`w-full py-2 rounded-xl text-xs font-black uppercase ${systemConfig.allowSignups ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}
                >
                  {systemConfig.allowSignups ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
              <label className="text-[10px] font-black uppercase text-slate-400">AI Model</label>
              <input
                className="mt-3 w-full bg-white border-2 border-slate-100 rounded-xl px-3 py-2 text-sm font-medium focus:border-teal-500 focus:ring-0"
                value={systemConfig.aiModel || ''}
                onChange={(e) => setSystemConfig((prev: any) => ({ ...prev, aiModel: e.target.value }))}
                placeholder="gemini-2.5-flash"
              />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-900">Pricing Plans</h4>
                <p className="text-xs text-slate-500 font-medium">Update plan pricing and features shown on the Plans page.</p>
              </div>
              <button
                onClick={() => {
                  setSystemConfig((prev: any) => {
                    const next = [...((prev.pricingPlans && prev.pricingPlans.length) ? prev.pricingPlans : defaultPlans)];
                    next.push({
                      id: `plan-${next.length + 1}`,
                      name: 'New Plan',
                      price: { usd: 0, ngn: 0 },
                      features: ['New feature'],
                      recommended: false,
                      limits: { portfolios: 1, customDomain: false }
                    });
                    return { ...prev, pricingPlans: next };
                  });
                }}
                className="px-3 py-2 rounded-xl text-[10px] font-black uppercase bg-white border border-slate-200 hover:border-teal-300 text-slate-600"
              >
                Add Plan
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {((systemConfig.pricingPlans && systemConfig.pricingPlans.length) ? systemConfig.pricingPlans : defaultPlans).map((plan: any, idx: number) => (
                <div key={plan.id || idx} className="bg-white border border-slate-100 rounded-2xl p-4 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400">Plan Name</label>
                        <input
                          type="text"
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2 text-sm font-medium focus:border-teal-500 focus:ring-0"
                          value={plan.name}
                          onChange={(e) => {
                            const name = e.target.value;
                            setSystemConfig((prev: any) => {
                              const next = [...((prev.pricingPlans && prev.pricingPlans.length) ? prev.pricingPlans : defaultPlans)];
                              next[idx] = { ...next[idx], name };
                              return { ...prev, pricingPlans: next };
                            });
                          }}
                          placeholder="Professional"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400">Plan ID</label>
                        <input
                          type="text"
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2 text-sm font-medium focus:border-teal-500 focus:ring-0"
                          value={plan.id}
                          onChange={(e) => {
                            const id = e.target.value;
                            setSystemConfig((prev: any) => {
                              const next = [...((prev.pricingPlans && prev.pricingPlans.length) ? prev.pricingPlans : defaultPlans)];
                              next[idx] = { ...next[idx], id };
                              return { ...prev, pricingPlans: next };
                            });
                          }}
                          placeholder="pro"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400">USD Price</label>
                      <input
                        type="number"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2 text-sm font-medium focus:border-teal-500 focus:ring-0"
                        value={plan.price?.usd ?? 0}
                        onChange={(e) => {
                          const usd = Number(e.target.value);
                          setSystemConfig((prev: any) => {
                            const next = [...((prev.pricingPlans && prev.pricingPlans.length) ? prev.pricingPlans : defaultPlans)];
                            next[idx] = { ...next[idx], price: { ...next[idx].price, usd } };
                            return { ...prev, pricingPlans: next };
                          });
                        }}
                        placeholder="USD"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400">NGN Price</label>
                      <input
                        type="number"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2 text-sm font-medium focus:border-teal-500 focus:ring-0"
                        value={plan.price?.ngn ?? 0}
                        onChange={(e) => {
                          const ngn = Number(e.target.value);
                          setSystemConfig((prev: any) => {
                            const next = [...((prev.pricingPlans && prev.pricingPlans.length) ? prev.pricingPlans : defaultPlans)];
                            next[idx] = { ...next[idx], price: { ...next[idx].price, ngn } };
                            return { ...prev, pricingPlans: next };
                          });
                        }}
                        placeholder="NGN"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Features (one per line)</label>
                    <textarea
                      className="w-full min-h-[100px] bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2 text-xs font-medium focus:border-teal-500 focus:ring-0"
                      value={(plan.features || []).join('\n')}
                      onChange={(e) => {
                        const features = e.target.value.split('\n').map((f) => f.trim()).filter(Boolean);
                        setSystemConfig((prev: any) => {
                          const next = [...((prev.pricingPlans && prev.pricingPlans.length) ? prev.pricingPlans : defaultPlans)];
                          next[idx] = { ...next[idx], features };
                          return { ...prev, pricingPlans: next };
                        });
                      }}
                      placeholder="Feature 1"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400">Portfolio Limit</label>
                      <input
                        type="number"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2 text-sm font-medium focus:border-teal-500 focus:ring-0"
                        value={plan.limits?.portfolios ?? 0}
                        onChange={(e) => {
                          const portfolios = Number(e.target.value);
                          setSystemConfig((prev: any) => {
                            const next = [...((prev.pricingPlans && prev.pricingPlans.length) ? prev.pricingPlans : defaultPlans)];
                            next[idx] = { ...next[idx], limits: { ...next[idx].limits, portfolios } };
                            return { ...prev, pricingPlans: next };
                          });
                        }}
                        placeholder="Portfolios"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400">Custom Domain</label>
                      <button
                        onClick={() => {
                          const customDomain = !plan.limits?.customDomain;
                          setSystemConfig((prev: any) => {
                            const next = [...((prev.pricingPlans && prev.pricingPlans.length) ? prev.pricingPlans : defaultPlans)];
                            next[idx] = { ...next[idx], limits: { ...next[idx].limits, customDomain } };
                            return { ...prev, pricingPlans: next };
                          });
                        }}
                        className={`w-full py-2 rounded-xl text-xs font-black uppercase ${plan.limits?.customDomain ? 'bg-teal-100 text-teal-700' : 'bg-slate-200 text-slate-600'}`}
                      >
                        {plan.limits?.customDomain ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => {
                        const recommended = !plan.recommended;
                        setSystemConfig((prev: any) => {
                          const next = [...((prev.pricingPlans && prev.pricingPlans.length) ? prev.pricingPlans : defaultPlans)];
                          next[idx] = { ...next[idx], recommended };
                          return { ...prev, pricingPlans: next };
                        });
                      }}
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${plan.recommended ? 'bg-teal-500 text-white' : 'bg-slate-200 text-slate-600'}`}
                    >
                      {plan.recommended ? 'Recommended' : 'Standard'}
                    </button>
                    <button
                      onClick={() => {
                        setSystemConfig((prev: any) => {
                          const next = [...((prev.pricingPlans && prev.pricingPlans.length) ? prev.pricingPlans : defaultPlans)];
                          next.splice(idx, 1);
                          return { ...prev, pricingPlans: next };
                        });
                      }}
                      className="text-[10px] font-black uppercase text-rose-500 hover:text-rose-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminConfigTab;
