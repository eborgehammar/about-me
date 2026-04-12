// app.js

const { createApp } = Vue;

createApp({
  data() {
    const { itemsById, groupsById, cells } = this.initializeFromGroupsData();
    return {
      itemsById,
      groupsById,
      cells,
      selectedItemCellIndexes: [],
      score: 0,
      mistakes: 0,
      activeGroupModalId: null,
      winShown: false,
    };
  },

  methods: {
    initializeFromGroupsData() {
      const itemsById = {};
      const groupsById = {};
      let allItemIds = [];

      GROUPS_DATA.forEach(group => {
        const itemIds = group.items.map(item => {
          itemsById[item.id] = {
            id: item.id,
            label: item.label,
            groupId: group.id,
          };
          return item.id;
        });

        groupsById[group.id] = {
          id: group.id,
          title: group.title,
          itemIds: itemIds,
          mergedItemIds: [],
          anchorCellIndex: null,
          completed: false,
        };

        allItemIds = allItemIds.concat(itemIds);
      });

      const totalCells = 45 * 45;

      // Shuffle items
      for (let i = allItemIds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allItemIds[i], allItemIds[j]] = [allItemIds[j], allItemIds[i]];
      }

      const cells = [];
      for (let i = 0; i < totalCells; i++) {
        const itemId = allItemIds[i] || null;
        cells.push({
          index: i,
          type: itemId ? "item" : null,
          itemId,
          groupId: null,
        });
      }

      return { itemsById, groupsById, cells };
    },

    cellClass(cell) {
      if (cell.type === null) return ["cell", "empty"];
      if (cell.type === "item") {
        const selected = this.selectedItemCellIndexes.includes(cell.index);
        return ["cell", "item", selected ? "selected" : ""];
      }
      if (cell.type === "group") {
        const group = this.groupsById[cell.groupId];
        return ["cell", "group", group.completed ? "completed" : ""];
      }
      return ["cell"];
    },

    handleCellClick(cell) {
      if (cell.type === null) return;
      if (this.winShown) return;

      if (cell.type === "group") {
        this.handleGroupCellClick(cell);
      } else if (cell.type === "item") {
        this.handleItemCellClick(cell);
      }
    },

    handleGroupCellClick(cell) {
      if (this.selectedItemCellIndexes.length > 1) return;

      // If a group tile is selected and this is the same group, merge groups
      if (this.selectedGroupCellIndex !== null) {
          const otherCell = this.cells[this.selectedGroupCellIndex];
      
          if (otherCell.groupId === cell.groupId) {
              this.mergeGroups(otherCell.index, cell.index, cell.groupId);
              this.selectedGroupCellIndex = null;
              return;
          }
      }

      // If exactly one item is selected, try to merge it into this group
      if (this.selectedItemCellIndexes.length === 1) {
          const itemCellIndex = this.selectedItemCellIndexes[0];
          const itemCell = this.cells[itemCellIndex];
          const item = this.itemsById[itemCell.itemId];
          const group = this.groupsById[cell.groupId];
  
        if (item.groupId === group.id) {
            // Valid merge
            this.mergeItemIntoGroup(item, itemCellIndex, group);
            this.selectedItemCellIndexes = [];
            return;
        } else {
            // Mismatch
            this.mistakes += 1;
            this.selectedItemCellIndexes = [];
            return;
        }
      }

      
      const group = this.groupsById[cell.groupId];
      this.activeGroupModalId = group.id;
    },

    mergeItemIntoGroup(item, itemCellIndex, group) {
      // Remove item from board
      this.cells[itemCellIndex] = {
          index: itemCellIndex,
          type: null,
          itemId: null,
          groupId: null
      };
  
      // Track merged items
      if (!group.mergedItemIds.includes(item.id)) {
          group.mergedItemIds.push(item.id);
      }
  
      this.compactBoard();
  
      if (this.isGroupFullyMerged(group.id)) {
          group.completed = true;
          this.checkWinCondition();
      }
  
      this.score += 1;
    }

    mergeGroups(indexA, indexB, groupId) {
        const group = this.groupsById[groupId];
    
        // Remove second group tile
        this.cells[indexB] = {
            index: indexB,
            type: null,
            itemId: null,
            groupId: null
        };
    
        // Compact board
        this.compactBoard();
    
        // If all items merged, complete group
        if (this.isGroupFullyMerged(groupId)) {
            group.completed = true;
            this.checkWinCondition();
        }
    }


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

    resolveSelection() {
      const [i1, i2] = this.selectedItemCellIndexes;
      const cell1 = this.cells[i1];
      const cell2 = this.cells[i2];

      const item1 = this.itemsById[cell1.itemId];
      const item2 = this.itemsById[cell2.itemId];

      if (item1.groupId === item2.groupId) {
        this.mergeItems(item1, item2, i1, i2);
        this.score += 1;
      } else {
        this.mistakes += 1;
      }

      this.selectedItemCellIndexes = [];
    },

    mergeItems(item1, item2, index1, index2) {
      const groupId = item1.groupId;
      const group = this.groupsById[groupId];

      if (!group.mergedItemIds.includes(item1.id)) {
        group.mergedItemIds.push(item1.id);
      }
      if (!group.mergedItemIds.includes(item2.id)) {
        group.mergedItemIds.push(item2.id);
      }

      if (group.anchorCellIndex === null) {
        group.anchorCellIndex = index1;
        this.cells[index1] = {
          index: index1,
          type: "group",
          groupId,
          itemId: null,
        };
      }

      this.cells[index2] = {
        index: index2,
        type: null,
        itemId: null,
        groupId: null,
      };

      this.compactBoard();

      if (this.isGroupFullyMerged(groupId)) {
        group.completed = true;
        this.checkWinCondition();
      }
    },

    isGroupFullyMerged(groupId) {
      return !this.cells.some(cell =>
        cell.type === "item" &&
        this.itemsById[cell.itemId].groupId === groupId
      );
    },

    checkWinCondition() {
      const allComplete = Object.values(this.groupsById).every(g => g.completed);
      if (allComplete) this.winShown = true;
    },

    groupPreviewItems(groupId) {
      return this.groupsById[groupId].mergedItemIds.slice(0, 3);
    },

    groupHasMore(groupId) {
      return this.groupsById[groupId].mergedItemIds.length > 3;
    },

    closeGroupModal() {
      this.activeGroupModalId = null;
    },

    compactBoard() {
      const SIZE = 45;

      // Convert to matrix
      const matrix = [];
      for (let col = 0; col < SIZE; col++) {
        const column = [];
        for (let row = 0; row < SIZE; row++) {
          const idx = row * SIZE + col;
          column.push(this.cells[idx]);
        }
        matrix.push(column);
      }

      // Vertical compression
      for (let col = 0; col < SIZE; col++) {
        const nonNull = matrix[col].filter(c => c.type !== null);
        const nulls = Array(SIZE - nonNull.length).fill({
          type: null,
          itemId: null,
          groupId: null,
        });
        matrix[col] = [...nonNull, ...nulls];
      }

      // Horizontal compression
      const nonEmptyColumns = matrix.filter(col =>
        col.some(c => c.type !== null)
      );
      const emptyColumnsNeeded = SIZE - nonEmptyColumns.length;
      const emptyColumn = Array(SIZE).fill({
        type: null,
        itemId: null,
        groupId: null,
      });

      const newMatrix = [
        ...nonEmptyColumns,
        ...Array(emptyColumnsNeeded).fill(emptyColumn),
      ];

      // Flatten back
      const newCells = [];
      for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
          const cell = newMatrix[col][row];
          const index = row * SIZE + col;
          newCells[index] = {
            index,
            type: cell.type,
            itemId: cell.itemId,
            groupId: cell.groupId,
          };
        }
      }

      // Update group anchors
      Object.values(this.groupsById).forEach(group => {
        if (group.anchorCellIndex !== null) {
          const newIndex = newCells.findIndex(
            c => c.type === "group" && c.groupId === group.id
          );
          group.anchorCellIndex = newIndex >= 0 ? newIndex : null;
        }
      });

      this.cells = newCells;
    },

    reshuffle() {
      const activeCells = this.cells.filter(c => c.type !== null);

      for (let i = activeCells.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [activeCells[i], activeCells[j]] = [activeCells[j], activeCells[i]];
      }

      const totalCells = this.cells.length;
      const newCells = [];

      for (let i = 0; i < totalCells; i++) {
        if (i < activeCells.length) {
          const c = activeCells[i];
          newCells[i] = {
            index: i,
            type: c.type,
            itemId: c.itemId,
            groupId: c.groupId,
          };
        } else {
          newCells[i] = {
            index: i,
            type: null,
            itemId: null,
            groupId: null,
          };
        }
      }

      this.cells = newCells;
      this.compactBoard();
      this.selectedItemCellIndexes = [];
      this.activeGroupModalId = null;
    },
  },
}).mount("#app");
