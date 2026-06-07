import { Printer } from "lucide-react";

const BrandLogo = ({ compact = false }) => {
    return (
        <div className="flex items-center gap-3">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-cyan-300 shadow-lg shadow-cyan-500/20 dark:bg-white dark:text-slate-950">
                <Printer size={25} />
                <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-400 ring-4 ring-white dark:ring-slate-950" />
            </div>
            {!compact && (
                <div>
                    <p className="text-xl font-black tracking-tight text-slate-950 dark:text-white">QloudPrint</p>
                    <p className="-mt-1 text-[11px] font-bold uppercase tracking-[0.24em] text-cyan-500">Marketplace</p>
                </div>
            )}
        </div>
    );
};

export default BrandLogo;
