import * as vscode from 'vscode';
import { getHighlighter } from './Highlighter';

const CLYPHX_LANG = 'clyphx';

function prevChar(document: vscode.TextDocument, position: vscode.Position) {
	if (position.character < 2) {
		return "";
	}
	return document.getText(new vscode.Range(position.translate(0, -2), position.translate(0, -1)));
}

const commandHandler = (name: string = 'world') => {
	const activeEditor = vscode.window.activeTextEditor;
	if (!activeEditor) {
		return;
	}

	for (const sel of activeEditor.selections) {
		const text = sel.isEmpty ?
			activeEditor.document.lineAt(sel.start.line).text :
			activeEditor.document.getText(sel);
		
		const cmd = text.split("\n")
			.map(l => l.indexOf("#") > -1 ? l.substring(0,l.indexOf("#")) : l)
			.join(" ")
			.replace(/[\s]+/g, " ")
			.trim();
		vscode.window.showInformationMessage(cmd);
		getHighlighter(activeEditor).highlight(sel.isEmpty ? 
			activeEditor.document.lineAt(sel.start.line) : sel);
	}
};

export function activate(context: vscode.ExtensionContext) {


	const cmdHandler = vscode.commands.registerCommand("clyphx.runLine", commandHandler)

	const channelProvider = vscode.languages.registerCompletionItemProvider(CLYPHX_LANG, {
		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {
			const items = [];

			if (!(position.character <= 1 || prevChar(document, position).match("\\s"))) {
				return undefined;
			}

			for (let i = 0; i < 10; i++) {
				const commitCharacterCompletion = new vscode.CompletionItem('CH' + i + '/');
				commitCharacterCompletion.commitCharacters = ['.'];
				commitCharacterCompletion.documentation = new vscode.MarkdownString('Press `.` to get `console.`');
				commitCharacterCompletion.range = new vscode.Range(position.translate(0, -1), position);
				items.push(commitCharacterCompletion);
			}

			return items;
		}
	}, '/', '"');

	const clipProvider = vscode.languages.registerCompletionItemProvider(CLYPHX_LANG, {
		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {
			const items = [];

			const linePrefix = document.lineAt(position).text.substr(0, position.character);
			if (!linePrefix.endsWith('CLIP')) {
				return undefined;
			}

			for (let i = 0; i < 10; i++) {
				const commitCharacterCompletion = new vscode.CompletionItem('CLIP' + i);
				items.push(commitCharacterCompletion);
			}

			return items;
		}
	}, 'P');

	const provider1 = vscode.languages.registerCompletionItemProvider(CLYPHX_LANG, {
		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {
			// a simple completion item which inserts `Hello World!`
			const simpleCompletion = new vscode.CompletionItem('Hello World!');

			// a completion item that inserts its text as snippet,
			// the `insertText`-property is a `SnippetString` which will be
			// honored by the editor.
			const snippetCompletion = new vscode.CompletionItem('Good part of the day');
			snippetCompletion.insertText = new vscode.SnippetString('Good ${1|morning,afternoon,evening|}. It is ${1}, right?');
			snippetCompletion.documentation = new vscode.MarkdownString("Inserts a snippet that lets you select the _appropriate_ part of the day for your greeting.");

			// a completion item that can be accepted by a commit character,
			// the `commitCharacters`-property is set which means that the completion will
			// be inserted and then the character will be typed.
			const commitCharacterCompletion = new vscode.CompletionItem('console');
			commitCharacterCompletion.commitCharacters = ['.'];
			commitCharacterCompletion.documentation = new vscode.MarkdownString('Press `.` to get `console.`');

			// a completion item that retriggers IntelliSense when being accepted,
			// the `command`-property is set which the editor will execute after 
			// completion has been inserted. Also, the `insertText` is set so that 
			// a space is inserted after `new`
			const commandCompletion = new vscode.CompletionItem('new');
			commandCompletion.kind = vscode.CompletionItemKind.Keyword;
			commandCompletion.insertText = 'new ';
			commandCompletion.command = { command: 'editor.action.triggerSuggest', title: 'Re-trigger completions...' };

			// return all completion items as array
			return [
				simpleCompletion,
				snippetCompletion,
				commitCharacterCompletion,
				commandCompletion
			];
		}
	});

	const provider2 = vscode.languages.registerCompletionItemProvider(
		'clyphx',
		{
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {

				// get all text until the `position` and check if it reads `console.`
				// and if so then complete if `log`, `warn`, and `error`
				const linePrefix = document.lineAt(position).text.substr(0, position.character);
				if (!linePrefix.endsWith('console.')) {
					return undefined;
				}

				return [
					new vscode.CompletionItem('log', vscode.CompletionItemKind.Method),
					new vscode.CompletionItem('warn', vscode.CompletionItemKind.Method),
					new vscode.CompletionItem('error', vscode.CompletionItemKind.Method),
				];
			}
		},
		'.' // triggered whenever a '.' is being typed
	);

	context.subscriptions.push(provider1, provider2, channelProvider, clipProvider, cmdHandler);
}