$(function() {
  'use strict';

  var archiver = {
    boards: [],
    initialize: function() {
      $.each(archiver.boards, function(key, board) {
        board.presentInDom = false;
      });

      var $boards = $('.boards-page-board-section');
      $.each($boards, function(key, board) {
        var board = archiver.findOrCreate(board);
        board.presentInDom = true;
      });

      archiver.removeNonPresentInDomBoards();
      archiver.renderBoards();
    },

    findOrCreate: function(board) {
      var boardName = archiver.getBoardNameFor(board);
      if (archiver.isBoardPresent(boardName)) {
        return archiver.getBoard(boardName);
      } else {
        return archiver.create({
          name: boardName,
          archived: archiver.isArchived(boardName),
          $element: $(board),
          hasBeenInitialized: false
        });
      }
    },

    isBoardPresent: function(boardName) {
      return archiver.getBoard(boardName) !== undefined;
    },

    create: function(board) {
      archiver.boards.push(board);
      return board;
    },

    getBoard: function(boardName) {
      var result;
      $.each(archiver.boards, function(key, board) {
        if (board.name == boardName) {
          result = board;
        }
      });
      return result;
    },

    removeNonPresentInDomBoards: function() {
      var boards = [];
      $.each(archiver.boards, function(key, board) {
        if (board.presentInDom) {
          boards.push(board);
        }
      });
      archiver.boards = boards;
    },

    renderBoards: function() {
      $.each(archiver.boards, function(key, board) {
        if (board.presentInDom && !board.hasBeenInitialized) {
          archiver.appendLink(board);
          board.hasBeenInitialized = true;
          archiver.renderBoard(board);
        }
      });
    },

    toggleBoard: function(boardName) {
      $.each(archiver.boards, function(key, board) {
        if (board.name == boardName) {
          board.archived = !board.archived;
          localStorage.setItem(board.name, board.archived);
          archiver.renderBoard(board);
        }
      });
    },

    renderBoard: function(board) {
      if (board.archived) {
        board.$element.find('.boards-page-board-section-list').hide();
        board.$element.find('.js-view-org-toggle .boards-page-board-section-header-options-item-name').text('Show');
      } else {
        board.$element.find('.boards-page-board-section-list').show();
        board.$element.find('.js-view-org-toggle .boards-page-board-section-header-options-item-name').text('Hide');
      }
    },

    getBoardNameFor: function(board) {
      var $board = $(board);
      return escape($board.find('.boards-page-board-section-header-name').text());
    },

    isArchived: function(boardName) {
      return (localStorage.getItem(boardName) == "true") ? true : false;
    },

    appendLink: function(board) {
      if (board.archived) {
        var link = '<a class="boards-page-board-section-header-options-item dark-hover js-view-org-toggle" data-board-name='+board.name+' href="#"><span class="icon-sm icon-archive boards-page-board-section-header-options-item-icon"></span><span class="boards-page-board-section-header-options-item-name">Show</span></a>'
      } else {
        var link = '<a class="boards-page-board-section-header-options-item dark-hover js-view-org-toggle" data-board-name='+board.name+' href="#"><span class="icon-sm icon-archive boards-page-board-section-header-options-item-icon"></span><span class="boards-page-board-section-header-options-item-name">Hide</span></a>'
      }
      board.$element.find('.boards-page-board-section-header-options').append(link);
    }
  };

  // Attache event listener on click on toggle board
  $('body').on('click', '.js-view-org-toggle', function(event) {
    var boardName = $(event.currentTarget).data('boardName');
    archiver.toggleBoard(boardName);
  });

  // MutationObserver
  var timeoutId;
  var observer = new MutationObserver(function(mutations) {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
    timeoutId = window.setTimeout(function() {
      archiver.initialize();
    }, 300);
  });

  var target = document.querySelector('#content');
  var config = { attributes: true, childList: true, characterData: true, subtree: true };
  observer.observe(target, config);

  archiver.initialize();
});
