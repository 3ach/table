# Torsion box table generator

A browser tool that draws a CNC-cuttable torsion box table and hands you the SVG.
You give it the finished size of the tabletop and the thickness of your sheet
stock; it works out the egg-crate frame underneath, nests every part on the
sheet, and exports the lot at real-world scale ready to cut.

It also knows about the [Lowrider 4](https://docs.v1e.com/lowrider/) CNC, and
will add the rails, the track cut-outs and the clips that hold them down. Set
the configuration to "No machine" and you get a plain torsion box table.

Live at <https://avec-sans.github.io/torsion-box-table/>. It runs entirely in
the browser — nothing is uploaded — and every push to `main` republishes it.

## How it works

Everything is derived from a handful of numbers, so there is nothing to draw by
hand:

- **Spar spacing** is a *maximum*. Say you never want spars more than 12in apart
  and the generator fits as many as that needs, then divides the space evenly —
  so the real spacing usually comes out a little tighter than you asked for.
- **Slots** are cut as wide as your material and half the thickness deep, from
  the top edge on the X spars and the bottom edge on the Y spars, so the two
  sets drop into each other.
- **Dog-bones** are added automatically to every inside corner, sized from your
  bit diameter, so a round cutter still leaves a corner a square part can seat
  into. They use the [minimal 45° relief](https://fablab.ruc.dk/more-elegant-cnc-dogbones/):
  the least material removed that still lets the joint close. Set the bit
  diameter to 0 to switch them off.
- **Nesting** lays every part out on one sheet with a clear margin between them,
  wide enough for the cutter to pass without touching either part.

## The 3D view

"Show 3D view" swaps the cut sheet for the assembled table — spars slotted
together, rails and spoilboard in place — built from the same numbers as the
drawing, so it is a check on the parameters rather than a separate model. Drag
to orbit, right-drag to pan, shift + right-drag to spin it about the vertical
axis, scroll to zoom. Individual parts can be hidden to see inside the frame.

It is a preview only; the SVG is still what you cut. three.js is a large
download, so it is only fetched the first time you open the view.

## Cutting one

1. Set your units and configuration, then work down the settings in the sidebar.
2. **Download the SVG and cut the calibration square first.** It is in the
   bottom corner of the sheet. Measure it — it should come out at exactly the
   size the sidebar says. If it does not, your CAM is scaling the file and
   nothing else will fit.
3. **Cut the test parts**, the two small pieces next to the calibration square.
   They are one X-spar slot and one Y-spar slot in your real material. Push them
   together: if they bottom out in the slot instead of pulling tight face to
   face, raise the **spar slot overcut** and re-cut them. If they are loose side
   to side, that is the material thickness setting, not the overcut.
4. Cut the sheet.

Parameters are saved in your browser as you go, so the table you were working on
is still there next time. **Export JSON** writes them to a file you can keep
alongside the cut, or hand to someone else to import.

## Settings

| Group | What it covers |
| --- | --- |
| Machine | Lowrider 4 or a plain table, and the units everything else is given in. Switching units converts the values you have already entered. |
| Material | Your sheet thickness, the cutter, and the space left between parts on the sheet. |
| Table size | The finished tabletop. The frame is inset from these by the overhang on every side. |
| Spars | Maximum spar spacing, and the overcut that sets how much clearance is left at the bottom of the slots where spars cross. |
| Rails | Rail stock, the longest piece your machine can cut in one go before a rail is split in two, and clip spacing. Lowrider 4 only. |
| Track fit | Padding on the flat and tube track cut-outs. Increase if the machine binds on the rails, decrease if it has play. |

Units are converted differently depending on what a number is for. Cut
dimensions round *up* to something you can actually cut — a whole millimetre, or
a sixteenth of an inch. Fit settings (bit diameter, overcut, part margin, track
buffers) are too small to survive that, so they convert exactly.

## Development

Requires Node LTS. [Bun](https://bun.sh) is what CI uses, but npm works.

```sh
npm install
npm run dev      # vite dev server
npm run build    # typecheck and build to dist/
npm run lint
```

Pushing to `main` builds and deploys to GitHub Pages via
[.github/workflows/deploy.yml](.github/workflows/deploy.yml).

### Layout

- `src/models/Table.ts` — every dimension, and the derived geometry (spar counts
  and spacing, slot depth, dog-bone radius, unit conversion). Almost all the
  real logic lives here.
- `src/components/` — one component per part (`XSpar`, `YSpar`, `TopRail`,
  `SideRail`, `TestParts`, `CalibrationSquare`), each emitting an SVG path from
  a `Table`. `TableLayout` nests them on the sheet; `TableEditor` is the
  sidebar.
- `src/components/Table3DView.tsx` — the 3D view, react-three-fiber over
  three.js. It builds its own meshes from the same `Table` getters rather than
  sharing geometry with the SVG components, so a change to how a part is cut has
  to be made in both places. `App.tsx` lazy-loads it.
- `src/lib/dogbone.ts` — the corner relief, shared by every part.
- `src/lib/storage.ts`, `src/lib/filename.ts` — browser persistence and export
  naming.

Adding a new dimension means adding it to `TableEditable`, `tableNumericFields`
and the constructor in `Table.ts`, plus a label in `TableEditor.tsx`. Snapshots
are read and written by field name, so import, export and saved settings pick it
up on their own, and a config saved before it existed still loads.

## Credits

Originally made by [Zach Zundel](https://github.com/3ach/table). The 3D view is
the work of [jeyeager65](https://github.com/jeyeager65), ported from
[their fork](https://github.com/jeyeager65/table). This version by
[avec sans](https://github.com/avec-sans/torsion-box-table).
