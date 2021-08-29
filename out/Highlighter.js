"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Highlighter = exports.getHighlighter = void 0;
const vscode = require("vscode");
function isLine(object) {
    return 'range' in object;
}
// create a decorator type that we use to decorate small numbers
const highlightStyle = vscode.window.createTextEditorDecorationType({
    overviewRulerColor: 'yellow',
    overviewRulerLane: vscode.OverviewRulerLane.Right,
    backgroundColor: 'rgba(255,255,200,0.2)'
});
const INSTANCES = new Map();
function getHighlighter(editor) {
    if (INSTANCES.has(editor)) {
        return INSTANCES.get(editor);
    }
    else {
        const inst = new Highlighter(editor);
        INSTANCES.set(editor, inst);
        return inst;
    }
}
exports.getHighlighter = getHighlighter;
class Highlighter {
    constructor(editor) {
        this.highlights = [];
        this.editor = editor;
    }
    highlight(range) {
        const decorator = {
            range: isLine(range) ? range.range : range
        };
        this.highlights.push(decorator);
        this.editor.setDecorations(highlightStyle, this.highlights);
        setTimeout(() => {
            this.highlights = this.highlights.filter(h => h != decorator);
            this.editor.setDecorations(highlightStyle, this.highlights);
        }, 1000);
    }
}
exports.Highlighter = Highlighter;
//# sourceMappingURL=Highlighter.js.map