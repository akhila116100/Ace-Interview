import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand('heygen-assistant.start', () => {
        const panel = vscode.window.createWebviewPanel(
            'heygenAvatar', // Identifies the type of the webview
            'HeyGen Interview Assistant', // The title of the panel
            vscode.ViewColumn.One, // Show the panel in the first column
            {
                // Enable JavaScript in the webview
                enableScripts: true,
                // Restrict the webview to only load content from our extension's directory
                localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'media'))]
            }
        );

        // Set the HTML content for the Webview
        panel.webview.html = getWebviewContent(panel.webview, context.extensionUri);
    });

    context.subscriptions.push(disposable);
}

function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
    
    // Create a local path to the webview script
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'main.js'));
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'style.css'));

    // HTML structure for the webview
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>HeyGen Avatar</title>
        <link href="${styleUri}" rel="stylesheet">
    </head>
    <body>
        <h2>HeyGen Interactive Interviewer (Free API)</h2>
        <p>Streaming 5 minutes of conversation uses 1 Free API credit, so keep sessions brief!</p>
        <button id="start-button">Start Interviewer</button>
        
        <div id="avatar-container" style="position: relative; width: 400px; height: 300px; margin-top: 20px; border: 1px solid gray;">
            <video id="avatarVideo" playsinline autoplay muted style="width: 100%; height: 100%; object-fit: cover;"></video>
            <div id="status">Status: Idle</div>
        </div>

        <button id="talk-button" disabled>Ask a Question</button>
        <input type="text" id="script-input" value="Introduce yourself and tell me about the job." style="width: 80%; padding: 5px;">

        <script src="${scriptUri}"></script>
    </body>
    </html>`;
}

// this method is called when your extension is deactivated
export function deactivate() {}