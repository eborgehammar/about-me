// app.js

const { createApp } = Vue;

const BOARD_SIZE = 5;              // <-- change to 45 for full game
const TOTAL_CELLS = BOARD_SIZE * BOARD_SIZE;

createApp({
  data() {
    const { itemsById, groupsById, cells } = this.initializeFromGroupsData();
    return {
      itemsById,
      groupsById,          // category definitions
      groupTiles: {},      // actual group tiles on board
      cells,
      selectedItemCellIndexes: [],
      selectedGroupCellIndex: null,
      score: 0,
      mistakes: 0,
      activeGroupModalId: null,
      winShown: false,
    };
  },

  methods: {
    // ------------------------------------------------------------
    // INITIALIZATION
    // ------------------------------------------------------------
    initializeFromGroupsData() {
      const itemsById = {};
      const groupsById = {};
      let allItemIds = [];

      GROUPS_DATA.forEach(group => {
        const itemIds = group.items.map(item => {
          itemsById[item.id] = {
            id: item.id,
            label: item.label,
            categoryId: group.id,
          };
          return item.id;
        });

        groupsById[group.id] = {
          id: group.id,
          title: group.title,
          itemIds,
        };

        allItemIds = allItemIds.concat(itemIds);
      });

      // Shuffle items
      for (let i = allItemIds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allItemIds[i], allItemIds[j]] = [allItemIds[j], allItemIds[i]];
      }

      // Fill board
      const cells = [];
      for (let i = 0; i < TOTAL_CELLS; i++) {
        const itemId = allItemIds[i] || null;
        cells.push({
          index: i,
          type: itemId ? "item" : null,
          itemId,
          tileId: null,
          categoryId: itemId ? itemsById[itemId].categoryId : null,
        });
      }

      return { itemsById, groupsById, cells };
    },

    // ------------------------------------------------------------
    // CELL CLASSES
    // ------------------------------------------------------------
    cellClass(cell) {
      if (cell.type === null) return ["cell", "empty"];
      if (cell.type === "item") {
        const selected = this.selectedItemCellIndexes.includes(cell.index);
        return ["cell", "item", selected ? "selected" : ""];
      }
      if (cell.type === "group") {
        const tile = this.groupTiles[cell.tileId];
        return ["cell", "group", tile.completed ? "completed" : ""];
      }
      return ["cell"];
    },

    // ------------------------------------------------------------
    // CLICK HANDLING
    // ------------------------------------------------------------
    handleCellClick(cell) {
      if (cell.type === null) return;
      if (this.winShown) return;

      if (cell.type === "group") {
        this.handleGroupCellClick(cell);
      } else if (cell.type === "item") {
        this.handleItemCellClick(cell);
      }
    },

    handleCellDoubleClick(cell) {
      if (cell.type === "group") {
        this.activeGroupModalId = cell.tileId;
      }
    },

    // ------------------------------------------------------------
    // GROUP TILE CLICK
    // ------------------------------------------------------------
    handleGroupCellClick(cell) {
      const tile = this.groupTiles[cell.tileId];

      // If exactly one item selected → merge item into this tile
      if (this.selectedItemCellIndexes.length === 1) {
        const itemCellIndex = this.selectedItemCellIndexes[0];
        const itemCell = this.cells[itemCellIndex];
        const item = this.itemsById[itemCell.itemId];

        if (item.categoryId === tile.categoryId) {
          this.mergeItemIntoTile(item, itemCellIndex, tile);
        } else {
          this.mistakes += 1;
        }

        this.selectedItemCellIndexes = [];
        return;
      }

      // If selecting a group tile
      if (this.selectedGroupCellIndex === null) {
        this.selectedGroupCellIndex = cell.index;
        return;
      }

      // If clicking another group tile → merge tiles if same category
      const otherCell = this.cells[this.selectedGroupCellIndex];
      const otherTile = this.groupTiles[otherCell.tileId];

      if (otherTile.categoryId === tile.categoryId) {
        this.mergeTiles(otherTile, tile);
      } else {
        this.mistakes += 1;
      }

      this.selectedGroupCellIndex = null;
    },

    // ------------------------------------------------------------
    // ITEM CLICK
    // ------------------------------------------------------------
    handleItemCellClick(cell) {
      const idx = cell.index;

      if (this.selectedItemCellIndexes.includes(idx)) {
        this.selectedItemCellIndexes =
          this.selectedItemCellIndexes.filter(i => i !== idx);
        return;
      }

      if (this.selectedItemCellIndexes.length >= 2) return;

      this.selectedItemCellIndexes.push(idx);

      if (this.selectedItemCellIndexes.length === 2) {
        this.resolveSelection();
      }
    },

    // ------------------------------------------------------------
    // ITEM + ITEM MERGE
    // ------------------------------------------------------------
    resolveSelection() {
      const [i1, i2] = this.selectedItemCellIndexes;
      const cell1 = this.cells[i1];
      const cell2 = this.cells[i2];

      const item1 = this.itemsById[cell1.itemId];
      const item2 = this.itemsById[cell2.itemId];

      if (item1.categoryId === item2.categoryId) {
        this.mergeItemsIntoNewTile(item1, item2, i1, i2);
        this.score += 1;
      } else {
        this.mistakes += 1;
      }

      this.selectedItemCellIndexes = [];
    },

    // ------------------------------------------------------------
    // CREATE NEW TILE FROM TWO ITEMS
    // ------------------------------------------------------------
    mergeItemsIntoNewTile(item1, item2, index1, index2) {
      const tileId = "tile_" + Date.now() + "_" + Math.random();
      const categoryId = item1.categoryId;

      this.groupTiles[tileId] = {
        tileId,
        categoryId,
        mergedItemIds: [item1.id, item2.id],
        anchorCellIndex: index1,
        completed: false,
      };

      // Convert index1 into group tile
      this.cells[index1] = {
        index: index1,
        type: "group",
        tileId,
        categoryId,
      };

      // Remove index2
      this.cells[index2] = {
        index: index2,
        type: null,
        itemId: null,
        tileId: null,
        categoryId: null,
      };

      this.compactBoard();
      this.checkTileCompletion(tileId);
    },

    // ------------------------------------------------------------
    // MERGE ITEM INTO EXISTING TILE
    // ------------------------------------------------------------
    mergeItemIntoTile(item, itemCellIndex, tile) {
      // Remove item from board
      this.cells[itemCellIndex] = {
        index: itemCellIndex,
        type: null,
        itemId: null,
        tileId: null,
        categoryId: null,
      };

      if (!tile.mergedItemIds.includes(item.id)) {
        tile.mergedItemIds.push(item.id);
      }

      this.compactBoard();
      this.checkTileCompletion(tile.tileId);
      this.score += 1;
    },

    // ------------------------------------------------------------
    // MERGE TWO TILES
    // ------------------------------------------------------------
    mergeTiles(tileA, tileB) {
      // Merge item lists
      tileA.mergedItemIds = [...new Set([...tileA.mergedItemIds, ...tileB.mergedItemIds])];

      // Remove tileB from board
      const anchor = tileB.anchorCellIndex;
      this.cells[anchor] = {
        index: anchor,
        type: null,
        itemId: null,
        tileId: null,
        categoryId: null,
      };

      delete this.groupTiles[tileB.tileId];

      this.compactBoard();
      this.checkTileCompletion(tileA.tileId);
    },

    // ------------------------------------------------------------
    // COMPLETION CHECK
    // ------------------------------------------------------------
    checkTileCompletion(tileId) {
      const tile = this.groupTiles[tileId];
      const category = this.groupsById[tile.categoryId];

      if (tile.mergedItemIds.length === category.itemIds.length) {
        tile.completed = true;
        this.checkWinCondition();
      }
    },

    checkWinCondition() {
      const allTiles = Object.values(this.groupTiles);
      if (allTiles.length === 0) return;

      const allComplete = allTiles.every(t => t.completed);
      if (allComplete) this.winShown = true;
    },

    // ------------------------------------------------------------
    // GROUP PREVIEW
    // ------------------------------------------------------------
    groupPreviewItems(tileId) {
      return this.groupTiles[tileId].mergedItemIds.slice(0, 3);
    },

    groupHasMore(tileId) {
      return this.groupTiles[tileId].mergedItemIds.length > 3;
    },

    // ------------------------------------------------------------
    // MODAL
    // ------------------------------------------------------------
    closeGroupModal() {
      this.activeGroupModalId = null;
    },

    // ------------------------------------------------------------
    // BOARD COMPACTION
    // ------------------------------------------------------------
    compactBoard() {
      const SIZE = BOARD_SIZE;

      const matrix = [];
      for (let col = 0; col < SIZE; col++) {
        const column = [];
        for (let row = 0; row < SIZE; row++) {
          const idx = row * SIZE + col;
          column.push(this.cells[idx]);
        }
        matrix.push(column);
      }

      // Vertical
      for (let col = 0; col < SIZE; col++) {
        const nonNull = matrix[col].filter(c => c.type !== null);
        const nulls = Array(SIZE - nonNull.length).fill({
          type: null,
          itemId: null,
          tileId: null,
          categoryId: null,
        });
        matrix[col] = [...nonNull, ...nulls];
      }

      // Horizontal
      const nonEmptyColumns = matrix.filter(col =>
        col.some(c => c.type !== null)
      );
      const emptyColumnsNeeded = SIZE - nonEmptyColumns.length;
      const emptyColumn = Array(SIZE).fill({
        type: null,
        itemId: null,
        tileId: null,
        categoryId: null,
      });

      const newMatrix = [
        ...nonEmptyColumns,
        ...Array(emptyColumnsNeeded).fill(emptyColumn),
      ];

      // Flatten
      const newCells = [];
      for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
          const cell = newMatrix[col][row];
          const index = row * SIZE + col;
          newCells[index] = {
            index,
            type: cell.type,
            itemId: cell.itemId,
            tileId: cell.tileId,
            categoryId: cell.categoryId,
          };
        }
      }

      // Update tile anchors
      Object.values(this.groupTiles).forEach(tile => {
        const newIndex = newCells.findIndex(
          c => c.type === "group" && c.tileId === tile.tileId
        );
        tile.anchorCellIndex = newIndex >= 0 ? newIndex : null;
      });

      this.cells = newCells;
    },

    // ------------------------------------------------------------
    // RESHUFFLE
    // ------------------------------------------------------------
    reshuffle() {
      const activeCells = this.cells.filter(c => c.type !== null);

      for (let i = activeCells.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [activeCells[i], activeCells[j]] = [activeCells[j], activeCells[i]];
      }

      const newCells = [];

      for (let i = 0; i < TOTAL_CELLS; i++) {
        if (i < activeCells.length) {
          const c = activeCells[i];
          newCells[i] = {
            index: i,
            type: c.type,
            itemId: c.itemId,
            tileId: c.tileId,
            categoryId: c.categoryId,
          };
        } else {
          newCells[i] = {
            index: i,
            type: null,
            itemId: null,
            tileId: null,
            categoryId: null,
          };
        }
      }

      this.cells = newCells;
      this.compactBoard();
      this.selectedItemCellIndexes = [];
      this.selectedGroupCellIndex = null;
      this.activeGroupModalId = null;
    },
  },
}).mount("#app");
