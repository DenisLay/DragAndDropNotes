window.onload = () => {
    workspaceHighlite = document.querySelector('.workspace-highlite');
    noteAdd = document.querySelector('.note-add');
    workspace = document.querySelector('.workspace');

    workspaceHighlite.addEventListener('mouseover', () => {
        workspace.classList.add('highlite');
    });

    workspaceHighlite.addEventListener('mouseleave', () => {
        workspace.classList.remove('highlite');
    });

    noteManager = new NoteManager(new NoteContainer(workspace));
    noteManager.mount();
}

class NoteContainer {
    constructor(workspace) {
        this.workspace = workspace;
        this.notes = [];
        this.gapStep = 10;
        this.topGap = this.gapStep;
        this.leftGap = this.gapStep;
        this.totalCurrentRowHeight = this.topGap;
        this.totalCurrentRowWidth = this.leftGap;
    }

    pushNode(note) {
        const noteElement = document.createElement('div');
        const noteContent = document.createElement('div');

        noteElement.classList.add('note');
        noteContent.classList.add('note-content');
        noteContent.innerHTML = note.content;
        noteElement.appendChild(noteContent);

        noteElement.style.top = `${this.topGap}px`;
        noteElement.style.left = `${this.leftGap}px`;

        this.workspace.appendChild(noteElement);
        this.notes.push({
            id: this.notes.length > 0 ? this.notes[this.notes.length - 1].id + 1 : 0,
            node: noteElement
        });

        const rect = noteElement.getClientRects()[0];
        this.leftGap += rect.width + this.gapStep;
        this.totalCurrentRowHeight = this.leftGap;
    }
}

class Note {
    constructor(content) {
        this.content = content;
    }
}

class NoteManager {
    constructor(container) {
        this.container = container;
    }

    mount() {
        noteAdd.addEventListener('click', () => {
            this.container.pushNode(new Note('Content'));
        });
    }
}