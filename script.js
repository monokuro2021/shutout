// SHUT OUT ゲームのJavaScript
class ShutOutGame {
    constructor() {
        this.boardSize = 7;
        this.board = [];
        this.currentPlayer = 'red';
        this.gameStarted = false;
        this.gameEnded = false; // ゲーム終了状態を管理
        this.currentAction = null;
        this.redBlocksToPlace = 1;
        this.blueBlocksToPlace = 1;
        this.blocksPlacedThisTurn = 0;
        this.lastBlockPlacer = null;
        this.init();
    }

    init() {
        this.createBoard();
        this.placeInitialPieces();
        this.render();
        this.updateCurrentPlayerDisplay();
        this.setupEventListeners();
    }

    createBoard() {
        this.board = [];
        for (let i = 0; i < this.boardSize; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.boardSize; j++) {
                this.board[i][j] = null;
            }
        }
    }

    placeInitialPieces() {
        // 赤の駒：左から2番目の列の中央の行（行3、列1）
        this.board[3][1] = 'red';
        
        // 青の駒：右から2番目の列の中央の行（行3、列5）
        this.board[3][5] = 'blue';
    }

    setupEventListeners() {
        document.getElementById('red-move-btn').addEventListener('click', () => this.selectAction('move'));
        document.getElementById('red-place-btn').addEventListener('click', () => this.selectAction('place'));
        document.getElementById('red-create-btn').addEventListener('click', () => this.selectAction('create'));
        document.getElementById('blue-move-btn').addEventListener('click', () => this.selectAction('move'));
        document.getElementById('blue-place-btn').addEventListener('click', () => this.selectAction('place'));
        document.getElementById('blue-create-btn').addEventListener('click', () => this.selectAction('create'));
    }

    selectAction(action) {
        // ゲーム終了後は操作を受け付けない
        if (this.gameEnded) return;
        
        this.currentAction = action;
        this.blocksPlacedThisTurn = 0;
        this.updateActionButtons();
        this.clearHighlights();
        
        if (action === 'move') {
            this.highlightValidMoves();
        } else if (action === 'place') {
            this.highlightValidPlaces();
        } else if (action === 'create') {
            this.executeCreateAction();
        }
    }

    updateActionButtons() {
        // すべてのボタンのアクティブ状態をリセット
        document.querySelectorAll('.action-btn').forEach(btn => btn.classList.remove('active'));
        
        // ゲーム終了後はすべてのボタンを無効化
        if (this.gameEnded) {
            document.querySelectorAll('.action-btn').forEach(btn => btn.disabled = true);
            return;
        }
        
        // 現在のプレイヤーのみボタンを有効化
        document.querySelectorAll('.action-btn').forEach(btn => btn.disabled = true);
        
        const currentPlayerPrefix = this.currentPlayer === 'red' ? 'red' : 'blue';
        const currentPlayerBlocks = this.currentPlayer === 'red' ? this.redBlocksToPlace : this.blueBlocksToPlace;
        const currentPlayerButtons = document.querySelectorAll(`#${currentPlayerPrefix}-move-btn, #${currentPlayerPrefix}-place-btn, #${currentPlayerPrefix}-create-btn`);
        
        // アクションが選択されていない場合はすべて有効化（ただし③つくるは制限あり）
        if (!this.currentAction) {
            currentPlayerButtons.forEach(btn => btn.disabled = false);
            
            // ブロック数が3の場合は③つくるを無効化
            if (currentPlayerBlocks >= 3) {
                document.getElementById(`${currentPlayerPrefix}-create-btn`).disabled = true;
            }
        } else {
            // アクションが選択されている場合は、そのアクションボタンのみ有効化
            if (this.currentAction === 'move') {
                document.getElementById(`${currentPlayerPrefix}-move-btn`).disabled = false;
                document.getElementById(`${currentPlayerPrefix}-move-btn`).classList.add('active');
            } else if (this.currentAction === 'place') {
                document.getElementById(`${currentPlayerPrefix}-place-btn`).disabled = false;
                document.getElementById(`${currentPlayerPrefix}-place-btn`).classList.add('active');
            } else if (this.currentAction === 'create') {
                document.getElementById(`${currentPlayerPrefix}-create-btn`).disabled = false;
                document.getElementById(`${currentPlayerPrefix}-create-btn`).classList.add('active');
            }
        }
        
        // プレイヤー情報のアクティブ状態を更新
        document.querySelectorAll('.player-info').forEach(info => info.classList.remove('active'));
        document.getElementById(`${currentPlayerPrefix}-player`).classList.add('active');
    }

    clearHighlights() {
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('valid-move', 'valid-place');
        });
    }

    highlightValidMoves() {
        const piecePos = this.findPiece(this.currentPlayer);
        if (!piecePos) return;

        const [row, col] = piecePos;
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        directions.forEach(([dr, dc]) => {
            const newRow = row + dr;
            const newCol = col + dc;
            
            if (this.isValidMove(newRow, newCol)) {
                const cell = document.querySelector(`[data-row="${newRow}"][data-col="${newCol}"]`);
                if (cell) cell.classList.add('valid-move');
            }
        });
    }

    highlightValidPlaces() {
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.isValidPlace(i, j)) {
                    const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                    if (cell) cell.classList.add('valid-place');
                }
            }
        }
    }

    isValidMove(row, col) {
        return row >= 0 && row < this.boardSize && 
               col >= 0 && col < this.boardSize && 
               this.board[row][col] === null;
    }

    isValidPlace(row, col) {
        return this.board[row][col] === null;
    }

    findPiece(player) {
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] === player) {
                    return [i, j];
                }
            }
        }
        return null;
    }

    executeCreateAction() {
        const currentBlocks = this.currentPlayer === 'red' ? this.redBlocksToPlace : this.blueBlocksToPlace;
        if (currentBlocks < 3) {
            if (this.currentPlayer === 'red') {
                this.redBlocksToPlace++;
            } else {
                this.blueBlocksToPlace++;
            }
            this.updateBlockCount();
        }
        this.endTurn();
    }

    updateBlockCount() {
        document.getElementById('red-blocks').textContent = this.redBlocksToPlace;
        document.getElementById('blue-blocks').textContent = this.blueBlocksToPlace;
    }

    endTurn() {
        // ターン終了時に勝利条件をチェック
        if (this.checkWinCondition()) {
            return; // 勝利条件が満たされたらゲーム終了
        }
        
        // 「②おく」アクションが実行された場合、配置可能ブロック数を1に戻す
        if (this.currentAction === 'place') {
            if (this.currentPlayer === 'red') {
                this.redBlocksToPlace = 1;
            } else {
                this.blueBlocksToPlace = 1;
            }
            this.updateBlockCount();
        }
        
        this.currentPlayer = this.currentPlayer === 'red' ? 'blue' : 'red';
        this.currentAction = null;
        this.blocksPlacedThisTurn = 0;
        this.updateCurrentPlayerDisplay();
        this.updateActionButtons();
        this.clearHighlights();
    }

    render() {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = '';

        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;

                if (this.board[i][j] === 'red' || this.board[i][j] === 'blue') {
                    const piece = document.createElement('div');
                    piece.className = `piece ${this.board[i][j]}-piece`;
                    cell.appendChild(piece);
                } else if (this.board[i][j] === 'block') {
                    cell.classList.add('block');
                }

                cell.addEventListener('click', () => this.handleCellClick(i, j));
                boardElement.appendChild(cell);
            }
        }
    }

    handleCellClick(row, col) {
        // ゲーム終了後は操作を受け付けない
        if (this.gameEnded) return;
        
        if (this.currentAction === 'move') {
            this.handleMoveAction(row, col);
        } else if (this.currentAction === 'place') {
            this.handlePlaceAction(row, col);
        }
    }

    handleMoveAction(row, col) {
        // ゲーム終了後は操作を受け付けない
        if (this.gameEnded) return;
        
        const piecePos = this.findPiece(this.currentPlayer);
        if (!piecePos) return;

        const [currentRow, currentCol] = piecePos;
        
        if (this.isValidMove(row, col) && this.isAdjacent(currentRow, currentCol, row, col)) {
            this.board[currentRow][currentCol] = null;
            this.board[row][col] = this.currentPlayer;
            this.render();
            
            // 移動後に勝利条件をチェック
            if (this.checkWinCondition()) {
                return; // 勝利条件が満たされたらゲーム終了
            }
            
            this.endTurn();
        }
    }

    handlePlaceAction(row, col) {
        // ゲーム終了後は操作を受け付けない
        if (this.gameEnded) return;
        
        if (this.isValidPlace(row, col)) {
            this.board[row][col] = 'block';
            this.lastBlockPlacer = this.currentPlayer;
            this.blocksPlacedThisTurn++;
            this.render();
            
            // ブロック配置後に勝利条件をチェック
            if (this.checkWinCondition()) {
                return; // 勝利条件が満たされたらゲーム終了
            }
            
            const currentBlocks = this.currentPlayer === 'red' ? this.redBlocksToPlace : this.blueBlocksToPlace;
            if (this.blocksPlacedThisTurn >= currentBlocks) {
                this.endTurn();
            } else {
                this.highlightValidPlaces();
            }
        }
    }

    isAdjacent(row1, col1, row2, col2) {
        const rowDiff = Math.abs(row1 - row2);
        const colDiff = Math.abs(col1 - col2);
        return rowDiff <= 1 && colDiff <= 1 && (rowDiff > 0 || colDiff > 0);
    }

    updateCurrentPlayerDisplay() {
        const playerColorElement = document.getElementById('player-color');
        playerColorElement.textContent = this.currentPlayer === 'red' ? '赤' : '青';
        playerColorElement.style.color = this.currentPlayer === 'red' ? '#ff4444' : '#4444ff';
    }

    
    checkWinCondition() {
        const nextPlayer = this.currentPlayer === 'red' ? 'blue' : 'red';
        
        // 1. 通常の勝利条件：相手の駒が動けない場合
        if (this.isPieceTrapped(nextPlayer)) {
            this.showWinner(this.currentPlayer, '相手を完全に封鎖しました！');
            return true;
        }
        
        // 2. 自滅ルール：ブロック配置による移動不能チェック
        const currentPlayerTrapped = this.isPieceTrapped(this.currentPlayer);
        const nextPlayerTrapped = this.isPieceTrapped(nextPlayer);
        
        if (currentPlayerTrapped && nextPlayerTrapped) {
            // 両方動けない場合：ブロックを配置した側（現在のプレイヤー）の勝ち
            this.showWinner(this.currentPlayer, '両プレイヤーが動け不能：ブロック配置側の勝ち');
            return true;
        } else if (currentPlayerTrapped) {
            // 自分だけ動けない場合：自滅で相手の勝ち
            this.showWinner(nextPlayer, '自滅：自分の駒が動けなくなりました');
            return true;
        }
        
        return false;
    }

    findAllEnclosedAreas() {
        // 連結した空き領域をすべて見つける
        const visited = new Set();
        const areas = [];
        
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                const key = `${i},${j}`;
                if (!visited.has(key) && this.board[i][j] !== 'block') {
                    const area = this.findConnectedArea(i, j, visited);
                    if (area.length > 0) {
                        areas.push(area);
                    }
                }
            }
        }
        
        return areas;
    }

    findConnectedArea(startRow, startCol, visited) {
        // 特定のマスから始まる連結領域を見つける
        const area = [];
        const toCheck = [{row: startRow, col: startCol}];
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        while (toCheck.length > 0) {
            const current = toCheck.pop();
            const key = `${current.row},${current.col}`;
            
            if (visited.has(key)) continue;
            if (!this.isValidPosition(current.row, current.col)) continue;
            if (this.board[current.row][current.col] === 'block') continue;
            
            visited.add(key);
            area.push({
                row: current.row, 
                col: current.col, 
                content: this.board[current.row][current.col]
            });
            
            // 8方向の隣接マスを探索
            for (const [dr, dc] of directions) {
                const newRow = current.row + dr;
                const newCol = current.col + dc;
                const newKey = `${newRow},${newCol}`;
                
                if (!visited.has(newKey) && this.isValidPosition(newRow, newCol)) {
                    if (this.board[newRow][newCol] !== 'block') {
                        toCheck.push({row: newRow, col: newCol});
                    }
                }
            }
        }
        
        return area;
    }

    hasRequiredPieces(spaces) {
        // 領域内に必要な駒の組み合わせがあるかチェック
        let hasRedPiece = false;
        let hasBluePiece = false;
        let emptySpaceCount = 0;
        
        for (const space of spaces) {
            if (space.content === 'red') hasRedPiece = true;
            else if (space.content === 'blue') hasBluePiece = true;
            else if (space.content === null) emptySpaceCount++;
        }
        
        // 3マス：赤1 + 青1 + 空1
        if (spaces.length === 3) {
            return hasRedPiece && hasBluePiece && emptySpaceCount === 1;
        }
        // 4マス：赤1 + 青1 + 空2
        else if (spaces.length === 4) {
            return hasRedPiece && hasBluePiece && emptySpaceCount === 2;
        }
        
        return false;
    }

    isAreaEnclosed(area) {
        // 領域がブロックと壁で完全に囲まれているかチェック
        const boundaryPositions = new Set();
        
        // 領域内の各マスの周囲をチェック
        for (const space of area) {
            const directions = [
                [-1, -1], [-1, 0], [-1, 1],
                [0, -1],           [0, 1],
                [1, -1],  [1, 0],  [1, 1]
            ];

            for (const [dr, dc] of directions) {
                const newRow = space.row + dr;
                const newCol = space.col + dc;
                const key = `${newRow},${newCol}`;
                
                // 領域内のマスは除く
                if (!area.some(s => s.row === newRow && s.col === newCol)) {
                    boundaryPositions.add(key);
                }
            }
        }

        // 境界のマスがすべてブロックかボード外かチェック
        for (const posKey of boundaryPositions) {
            const [row, col] = posKey.split(',').map(Number);
            
            if (!this.isValidPosition(row, col)) {
                // ボードの外側は壁としてOK
                continue;
            }
            
            if (this.board[row][col] !== 'block') {
                // ブロックでないマスがあれば囲まれていない
                return false;
            }
        }

        return true;
    }

    findConnectedSpaces(spaces) {
        // この関数は不要になった（findAllEnclosedAreasが連結領域を直接返す）
        return spaces;
    }

    isPieceTrapped(player) {
        const piecePos = this.findPiece(player);
        if (!piecePos) return false;
        
        const [row, col] = piecePos;
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;
            
            if (this.isValidMove(newRow, newCol)) {
                return false;
            }
        }
        
        return true;
    }

    checkThreeSpaceTrap() {
        // すべての3マスの組み合わせをチェック
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                // 隣接する3マスの組み合わせをチェック
                const trap = this.checkConnectedThreeSpaces(i, j);
                if (trap) return trap;
                
                // 直線上の3マスをチェック
                if (j <= this.boardSize - 3) {
                    const trap = this.checkThreeSpaces(i, j, i, j + 1, i, j + 2);
                    if (trap) return trap;
                }
                
                // 垂直方向の3マス
                if (i <= this.boardSize - 3) {
                    const trap = this.checkThreeSpaces(i, j, i + 1, j, i + 2, j);
                    if (trap) return trap;
                }
                
                // 斜め方向（左上→右下）の3マス
                if (i <= this.boardSize - 3 && j <= this.boardSize - 3) {
                    const trap = this.checkThreeSpaces(i, j, i + 1, j + 1, i + 2, j + 2);
                    if (trap) return trap;
                }
                
                // 斜め方向（右上→左下）の3マス
                if (i <= this.boardSize - 3 && j >= 2) {
                    const trap = this.checkThreeSpaces(i, j, i + 1, j - 1, i + 2, j - 2);
                    if (trap) return trap;
                }
            }
        }
        
        return null;
    }

    checkConnectedThreeSpaces(startRow, startCol) {
        // 8方向の隣接マスを取得
        const adjacentSpaces = [];
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        for (const [dr, dc] of directions) {
            const newRow = startRow + dr;
            const newCol = startCol + dc;
            if (this.isValidPosition(newRow, newCol)) {
                adjacentSpaces.push({ row: newRow, col: newCol });
            }
        }

        // 3マスの組み合わせをすべてチェック
        for (let i = 0; i < adjacentSpaces.length; i++) {
            for (let j = i + 1; j < adjacentSpaces.length; j++) {
                const spaces = [
                    { row: startRow, col: startCol, content: this.board[startRow][startCol] },
                    adjacentSpaces[i],
                    adjacentSpaces[j]
                ];
                
                const trap = this.checkThreeSpacesCondition(spaces);
                if (trap) return trap;
            }
        }

        return null;
    }

    checkThreeSpacesCondition(spaces) {
    // 3マスの内容をチェック：赤駒1つ + 青駒1つ + 空きマス1つの組み合わせ
    let hasRedPiece = false;
    let hasBluePiece = false;
    let hasEmptySpace = false;
    
    for (const space of spaces) {
        const content = this.board[space.row][space.col];
        if (content === 'red') hasRedPiece = true;
        else if (content === 'blue') hasBluePiece = true;
        else if (content === null) hasEmptySpace = true;
        else return null; // ブロックが含まれている場合は無効
    }

    if (!(hasRedPiece && hasBluePiece && hasEmptySpace)) {
        return null;
    }

    // 3マスが囲まれているかチェック
    if (this.areSpacesEnclosed(spaces)) {
        const lastBlockPlacer = this.findLastBlockPlacer();
        if (lastBlockPlacer) {
            return { winner: lastBlockPlacer === 'red' ? 'blue' : 'red' };
        }
    }

    return null;
}

checkFourSpaceTrap() {
        // すべての4マスの組み合わせをチェック
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                // 隣接する4マスの組み合わせをチェック
                const trap = this.checkConnectedFourSpaces(i, j);
                if (trap) return trap;
                
                // 直線上の4マスをチェック
                if (j <= this.boardSize - 4) {
                    const trap = this.checkFourSpaces(i, j, i, j + 1, i, j + 2, i, j + 3);
                    if (trap) return trap;
                }
                
                // 垂直方向の4マス
                if (i <= this.boardSize - 4) {
                    const trap = this.checkFourSpaces(i, j, i + 1, j, i + 2, j, i + 3, j);
                    if (trap) return trap;
                }
                
                // 斜め方向（左上→右下）の4マス
                if (i <= this.boardSize - 4 && j <= this.boardSize - 4) {
                    const trap = this.checkFourSpaces(i, j, i + 1, j + 1, i + 2, j + 2, i + 3, j + 3);
                    if (trap) return trap;
                }
                
                // 斜め方向（右上→左下）の4マス
                if (i <= this.boardSize - 4 && j >= 3) {
                    const trap = this.checkFourSpaces(i, j, i + 1, j - 1, i + 2, j - 2, i + 3, j - 3);
                    if (trap) return trap;
                }
            }
        }
        
        return null;
    }

    checkFourSpaces(r1, c1, r2, c2, r3, c3, r4, c4) {
        // 4マスが有効な範囲内かチェック
        if (!this.isValidPosition(r1, c1) || !this.isValidPosition(r2, c2) || 
            !this.isValidPosition(r3, c3) || !this.isValidPosition(r4, c4)) {
            return null;
        }

        const spaces = [
            { row: r1, col: c1, content: this.board[r1][c1] },
            { row: r2, col: c2, content: this.board[r2][c2] },
            { row: r3, col: c3, content: this.board[r3][c3] },
            { row: r4, col: c4, content: this.board[r4][c4] }
        ];

        // 4マスの内容をチェック：赤駒1つ + 青駒1つ + 空きマス2つの組み合わせ
        let hasRedPiece = false;
        let hasBluePiece = false;
        let emptySpaceCount = 0;
        
        for (const space of spaces) {
            if (space.content === 'red') hasRedPiece = true;
            else if (space.content === 'blue') hasBluePiece = true;
            else if (space.content === null) emptySpaceCount++;
            else return null; // ブロックが含まれている場合は無効
        }

        if (!(hasRedPiece && hasBluePiece && emptySpaceCount === 2)) {
            return null;
        }

        // 4マスが囲まれているかチェック
        if (this.areSpacesEnclosed(spaces)) {
            // 最後にブロックを配置したプレイヤーを特定
            const lastBlockPlacer = this.findLastBlockPlacer();
            if (lastBlockPlacer) {
                return { winner: lastBlockPlacer === 'red' ? 'blue' : 'red' };
            }
        }

        return null;
    }

checkConnectedFourSpaces(startRow, startCol) {
        // 8方向の隣接マスを取得
        const adjacentSpaces = [];
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        for (const [dr, dc] of directions) {
            const newRow = startRow + dr;
            const newCol = startCol + dc;
            if (this.isValidPosition(newRow, newCol)) {
                adjacentSpaces.push({ row: newRow, col: newCol });
            }
        }

        // 4マスの組み合わせをすべてチェック
        for (let i = 0; i < adjacentSpaces.length; i++) {
            for (let j = i + 1; j < adjacentSpaces.length; j++) {
                for (let k = j + 1; k < adjacentSpaces.length; k++) {
                    const spaces = [
                        { row: startRow, col: startCol, content: this.board[startRow][startCol] },
                        adjacentSpaces[i],
                        adjacentSpaces[j],
                        adjacentSpaces[k]
                    ];
                    
                    const trap = this.checkFourSpacesCondition(spaces);
                    if (trap) return trap;
                }
            }
        }

        return null;
    }

    checkFourSpacesCondition(spaces) {
        // 4マスの内容をチェック：赤駒1つ + 青駒1つ + 空きマス2つの組み合わせ
        let hasRedPiece = false;
        let hasBluePiece = false;
        let emptySpaceCount = 0;
        
        for (const space of spaces) {
            const content = this.board[space.row][space.col];
            if (content === 'red') hasRedPiece = true;
            else if (content === 'blue') hasBluePiece = true;
            else if (content === null) emptySpaceCount++;
            else return null; // ブロックが含まれている場合は無効
        }

        if (!(hasRedPiece && hasBluePiece && emptySpaceCount === 2)) {
            return null;
        }

        // 4マスが囲まれているかチェック
        if (this.areSpacesEnclosed(spaces)) {
            // 最後にブロックを配置したプレイヤーを特定
            const lastBlockPlacer = this.findLastBlockPlacer();
            if (lastBlockPlacer) {
                return { winner: lastBlockPlacer === 'red' ? 'blue' : 'red' };
            }
        }

        return null;
    }

    checkThreeSpaces(r1, c1, r2, c2, r3, c3) {
        // 3マスが有効な範囲内かチェック
        if (!this.isValidPosition(r1, c1) || !this.isValidPosition(r2, c2) || !this.isValidPosition(r3, c3)) {
            return null;
        }

        const spaces = [
            { row: r1, col: c1, content: this.board[r1][c1] },
            { row: r2, col: c2, content: this.board[r2][c2] },
            { row: r3, col: c3, content: this.board[r3][c3] }
        ];

        // 3マスの内容をチェック：自分の駒、相手の駒、空きマスの組み合わせ
        let hasRedPiece = false;
        let hasBluePiece = false;
        let hasEmptySpace = false;
        
        for (const space of spaces) {
            if (space.content === 'red') hasRedPiece = true;
            else if (space.content === 'blue') hasBluePiece = true;
            else if (space.content === null) hasEmptySpace = true;
            else return null; // ブロックが含まれている場合は無効
        }

        if (!(hasRedPiece && hasBluePiece && hasEmptySpace)) {
            return null;
        }

        // 3マスが囲まれているかチェック
        if (this.areSpacesEnclosed(spaces)) {
            // 最後にブロックを配置したプレイヤーを特定
            const lastBlockPlacer = this.findLastBlockPlacer();
            if (lastBlockPlacer) {
                return { winner: lastBlockPlacer === 'red' ? 'blue' : 'red' };
            }
        }

        return null;
    }

    isValidPosition(row, col) {
        return row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize;
    }

    areSpacesEnclosed(spaces) {
        // 3マスの周囲をチェック
        const surroundingPositions = new Set();
        
        for (const space of spaces) {
            const directions = [
                [-1, -1], [-1, 0], [-1, 1],
                [0, -1],           [0, 1],
                [1, -1],  [1, 0],  [1, 1]
            ];

            for (const [dr, dc] of directions) {
                const newRow = space.row + dr;
                const newCol = space.col + dc;
                const key = `${newRow},${newCol}`;
                
                // 3マス自体は除く
                if (!spaces.some(s => s.row === newRow && s.col === newCol)) {
                    surroundingPositions.add(key);
                }
            }
        }

        // 周囲のマスがすべてブロックまたは壁で囲まれているかチェック
        for (const posKey of surroundingPositions) {
            const [row, col] = posKey.split(',').map(Number);
            
            if (!this.isValidPosition(row, col)) {
                continue; // ボードの外側は壁とみなす
            }
            
            if (this.board[row][col] !== 'block') {
                return false; // ブロックでないマスがある
            }
        }

        return true;
    }

    findLastBlockPlacer() {
        return this.lastBlockPlacer;
    }

    showWinner(winner, reason = '相手の駒が動けなくなりました') {
        this.gameEnded = true; // ゲーム終了状態に設定
        const winnerText = winner === 'red' ? '赤' : '青';
        const winnerColor = winner === 'red' ? '#ff4444' : '#4444ff';
        
        setTimeout(() => {
            const message = document.createElement('div');
            message.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 30px;
                border: 3px solid #333;
                border-radius: 10px;
                font-size: 24px;
                font-weight: bold;
                color: ${winnerColor};
                text-align: center;
                z-index: 1000;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            `;
            message.innerHTML = `
                <div>${winnerText}の勝利！</div>
                <div style="font-size: 16px; color: #666; margin-top: 10px;">
                    ${reason}
                </div>
                <button onclick="location.reload()" style="
                    margin-top: 20px;
                    padding: 10px 20px;
                    font-size: 16px;
                    background: ${winnerColor};
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                ">新しいゲーム</button>
            `;
            document.body.appendChild(message);
        }, 100);
    }
}

// ゲームの初期化
document.addEventListener('DOMContentLoaded', () => {
    const game = new ShutOutGame();
});
