import * as vscode from "vscode";

function isLine(object: any): object is vscode.TextLine {
    return 'range' in object;
}

// create a decorator type that we use to decorate small numbers
const highlightStyle = vscode.window.createTextEditorDecorationType({
    overviewRulerColor: 'yellow',
    overviewRulerLane: vscode.OverviewRulerLane.Right,
    backgroundColor: 'rgba(255,255,200,0.2)'
});

const INSTANCES = new Map<vscode.TextEditor, Highlighter>();

export function getHighlighter(editor:vscode.TextEditor):Highlighter {
    if (INSTANCES.has(editor)) {
        return INSTANCES.get(editor)!;
    } else {
        const inst = new Highlighter(editor);
        INSTANCES.set(editor, inst);
        return inst;
    }
}

export class Highlighter {
    private readonly editor: vscode.TextEditor;
    private highlights: vscode.DecorationOptions[] = [];

    constructor(editor: vscode.TextEditor) {
        this.editor = editor;
    }

    highlight(range: vscode.Range | vscode.TextLine): void {
        const decorator: vscode.DecorationOptions = {
            range: isLine(range) ? range.range : range
        }

        this.highlights.push(decorator);
        this.editor.setDecorations(highlightStyle, this.highlights);
        setTimeout(() => {
            this.highlights = this.highlights.filter(h => h != decorator);
            this.editor.setDecorations(highlightStyle, this.highlights);
        }, 1000);
    }
}