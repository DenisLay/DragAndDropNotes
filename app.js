window.onload = () => {
    workspaceHighlite = document.querySelector('.workspace-highlite');
    noteAdd = document.querySelector('.note-add');
    workspace = document.querySelector('.workspace');
    gapX = 0, gapY = 0, startX = 0, startY = 0, innerGapX = 0, innerGapY = 0;

    noteContainer = new NoteContainer(workspace);

    noteManager = new NoteManager(noteContainer);
    noteManager.mount();

    workspaceHighlite.addEventListener('mouseover', () => {
        /*workspace.classList.add('highlite');*/
        noteContainer.setVisibilitySnapLine('top', true);
        noteContainer.setVisibilitySnapLine('bottom', true);
        noteContainer.setVisibilitySnapLine('left', true);
        noteContainer.setVisibilitySnapLine('right', true);
    });

    workspaceHighlite.addEventListener('mouseleave', () => {
        /*workspace.classList.remove('highlite');*/
        noteContainer.setVisibilitySnapLine('top', false);
        noteContainer.setVisibilitySnapLine('bottom', false);
        noteContainer.setVisibilitySnapLine('left', false);
        noteContainer.setVisibilitySnapLine('right', false);
    });
}

class NoteContainer {
    constructor(workspace) {
        this.workspace = workspace;
        this.notes = [];
        this.xPos = 10;
        this.yPos = 10;
        this.snapThreshold = 7;
        this.notePositionManager = new NotePositionManager();
        this.movingObserver = new MutationObserver((mutations) => {
            let isCloseToTop = false;
            let isCloseToBottom = false;
            let isCloseToLeft = false;
            let isCloseToRight = false;
            
            mutations.forEach(mutation => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    if (Number(mutation.target.style.top.replace('px', '')) <= this.snapThreshold) {
                        mutation.target.style.top = `${0}px`;
                        isCloseToTop = true;
                    }

                    if (this.workspace.getClientRects()[0].height - Number(mutation.target.style.top.replace('px', '')) - mutation.target.getClientRects()[0].height <= this.snapThreshold) {
                        mutation.target.style.top = `${this.workspace.getClientRects()[0].height - mutation.target.getClientRects()[0].height}px`;
                        isCloseToBottom = true;
                    }

                    if (Number(mutation.target.style.left.replace('px', '')) <= this.snapThreshold) {
                        mutation.target.style.left = `${0}px`;
                        isCloseToLeft = true;
                    }

                    if (this.workspace.getClientRects()[0].width - Number(mutation.target.style.left.replace('px', '')) - mutation.target.getClientRects()[0].width <= this.snapThreshold) {
                        mutation.target.style.left = `${this.workspace.getClientRects()[0].width - mutation.target.getClientRects()[0].width}px`;
                        isCloseToRight = true;
                    }

                    this.notes.forEach(note => {
                        if (note.node != mutation.target) {
                            let isReacts = this.notePositionManager.reactCurrentWith(mutation.target, note);

                            if (isReacts) {
                                note.node.classList.add('reacts');
                            } else {
                                note.node.classList.remove('reacts');
                            }
                        }
                    });
                }
            });

            if (isCloseToTop) {
                this.setVisibilitySnapLine('top', true);
            } else {
                this.setVisibilitySnapLine('top', false);
            }

            if (isCloseToBottom) {
                this.setVisibilitySnapLine('bottom', true);
            } else {
                this.setVisibilitySnapLine('bottom', false);
            }

            if (isCloseToLeft) {
                this.setVisibilitySnapLine('left', true);
            } else {
                this.setVisibilitySnapLine('left', false);
            }

            if (isCloseToRight) {
                this.setVisibilitySnapLine('right', true);
            } else {
                this.setVisibilitySnapLine('right', false);
            }
        });

        const topSnapLine = document.createElement('div');
        topSnapLine.classList.add('top-snapline');
        
        const bottomSnapLine = document.createElement('div');
        bottomSnapLine.classList.add('bottom-snapline');

        const leftSnapLine = document.createElement('div');
        leftSnapLine.classList.add('left-snapline');

        const rightSnapLine = document.createElement('div');
        rightSnapLine.classList.add('right-snapline');

        this.workspace.appendChild(topSnapLine);
        this.workspace.appendChild(bottomSnapLine);
        this.workspace.appendChild(leftSnapLine);
        this.workspace.appendChild(rightSnapLine);
    }

    pushNode(note) {
        const noteElement = document.createElement('div');
        const noteContent = document.createElement('div');

        noteElement.classList.add('note');
        noteContent.classList.add('note-content');
        noteContent.innerHTML = note.content;
        noteElement.appendChild(noteContent);

        noteElement.style.top = `${this.xPos}px`;
        noteElement.style.left = `${this.yPos}px`;

        const newNote = {
            id: this.notes.length > 0 ? this.notes[this.notes.length - 1].id + 1 : 0,
            node: noteElement,
            move: false
        };

        this.workspace.appendChild(noteElement);
        this.notes.push(newNote);

        this.movingObserver.observe(newNote.node, { attributes: true });
        this.mountNoteBehaviour(newNote);

        const rect = noteElement.getClientRects()[0];
        this.leftGap += rect.width + this.gapStep;
        this.totalCurrentRowHeight = this.leftGap;
    }

    mountNoteBehaviour(note) {
        note.node.addEventListener('mousedown', (event) => {
            note.move = true;
            gapX = workspace.getClientRects()[0].left;
            gapY = workspace.getClientRects()[0].top;
            startX = event.clientX - gapX;
            startY = event.clientY - gapY;
            innerGapX = startX - Number(note.node.style.left.replace('px', ''));
            innerGapY = startY - Number(note.node.style.top.replace('px', ''));
        });

        this.workspace.addEventListener('mousemove', (event) => {
            if (note.move) {
                const translateClientX = event.clientX - gapX;
                const translateClientY = event.clientY - gapY;

                note.node.style.left = `${translateClientX - innerGapX}px`;
                note.node.style.top = `${translateClientY - innerGapY}px`;
            }
        });

        this.workspace.addEventListener('mouseup', () => {
            note.move = false;
        });
    }

    setVisibilitySnapLine(side, mode) {
        let lineClass = '';

        if (side == 'top') {
            lineClass = '.top-snapline';
        } else if (side == 'bottom') {
            lineClass = '.bottom-snapline';
        } else if (side == 'left') {
            lineClass = '.left-snapline';
        } else if (side == 'right') {
            lineClass = '.right-snapline';
        }

        const snapLine = this.workspace.querySelector(lineClass);

        if (mode) {
            snapLine.classList.add('active');
        } else {
            snapLine.classList.remove('active');
        }
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

class NotePositionManager {
    reactCurrentWith(currentNote, otherNote) {
        let currentNoteRect = currentNote.getClientRects()[0];
        let otherNoteRect = otherNote.node.getClientRects()[0];

        let isReactsWith = false;
        let isCurrentLeftInside = false;
        let isCurrentRightInside = false;
        let isCurrentTopInside = false;
        let isCurrentBottomInside = false;
        
        if (currentNoteRect.left >= otherNoteRect.left && (currentNoteRect.left < otherNoteRect.left + otherNoteRect.width)) {
            isCurrentLeftInside = true;
        }

        if (currentNoteRect.left + currentNoteRect.width >= otherNoteRect.left && (currentNoteRect.left + currentNoteRect.width < otherNoteRect.left + otherNoteRect.width)) {
            isCurrentRightInside = true;
        }

        if (currentNoteRect.top >= otherNoteRect.top && (currentNoteRect.top < otherNoteRect.top + otherNoteRect.height)) {
            isCurrentTopInside = true;
        }

        if (currentNoteRect.top + currentNoteRect.height >= otherNoteRect.top && (currentNoteRect.top + currentNoteRect.height < otherNoteRect.top + otherNoteRect.height)) {
            isCurrentBottomInside = true;
        }

        if ((isCurrentBottomInside && isCurrentRightInside) ||
            (isCurrentBottomInside && isCurrentLeftInside) ||
            (isCurrentTopInside && isCurrentRightInside) ||
            (isCurrentTopInside && isCurrentLeftInside)) {
                isReactsWith = true;
            }

        return isReactsWith;
    }

    /*reactCurrentWithBorder(currentNote, workspaceRect) {
        return '';
    }*/
}