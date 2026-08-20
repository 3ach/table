import { smallButtonClasses } from "../lib/styles";

type ViewToggleButtonProps = {
    view3D: boolean;
    onToggle: () => void;
};

// Switches the main panel between the nested cut sheet and the assembled 3D
// model. The 3D view is only what the parts add up to - the sheet is what you
// actually cut.
export default function ViewToggleButton({ view3D, onToggle }: ViewToggleButtonProps) {
    return (
        <button
            className={`${smallButtonClasses} w-full bg-slate-500 hover:bg-slate-600 focus:ring-slate-300`}
            onClick={onToggle}
        >
            {view3D ? 'Show cut sheet' : 'Show 3D view'}
        </button>
    );
}
