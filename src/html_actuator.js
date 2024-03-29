﻿function HTMLActuator() {
    this.tileContainer = document.querySelector(".tile-container");
    this.scoreContainer = document.querySelector(".score-container");
    this.bestContainer = document.querySelector(".best-container");
    this.messageContainer = document.querySelector(".game-message");
    this.sharingContainer = document.querySelector(".score-sharing");

    this.score = 0;
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
    var self = this;

    window.requestAnimationFrame(function () {
        self.clearContainer(self.tileContainer);

        grid.cells.forEach(function (column) {
            column.forEach(function (cell) {
                if (cell) {
                    self.addTile(cell);
                }
            });
        });

        self.updateScore(metadata.score);
        self.updateBestScore(metadata.bestScore);

        if (metadata.terminated) {
            if (metadata.over) {
                self.message(false); // You lose
            } else if (metadata.won) {
                self.message(true); // You win!
            }
        }

    });
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continue = function () {
    if (typeof ga !== "undefined") {
        ga("send", "event", "game", "restart");
    }

    this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
    try {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    } catch (error) {
        console.log("游戏已结束。");
    }

};

HTMLActuator.prototype.addTile = function (tile) {
    var text = "  　　      ";
    var self = this;
    var text2 = function (n) { var r = 0; while (n > 1) r++, n >>= 1; return r; }

    var wrapper = document.createElement("div");
    var inner = document.createElement("div");
    var position = tile.previousPosition || { x: tile.x, y: tile.y };
    var positionClass = this.positionClass(position);

    // We can't use classlist because it somehow glitches when replacing classes
    var classes = ["tile", "tile-" + tile.value, positionClass];

    if (tile.value > 8192) classes.push("tile-super");

    this.applyClasses(wrapper, classes);

    inner.classList.add("tile-inner");
    inner.textContent = text[text2(tile.value)];

    if (tile.previousPosition) {
        // Make sure that the tile gets rendered in the previous position first
        window.requestAnimationFrame(function () {
            classes[2] = self.positionClass({ x: tile.x, y: tile.y });
            self.applyClasses(wrapper, classes); // Update the position
        });
    } else if (tile.mergedFrom) {
        classes.push("tile-merged");
        this.applyClasses(wrapper, classes);

        // Render the tiles that merged
        tile.mergedFrom.forEach(function (merged) {
            self.addTile(merged);
        });
    } else {
        classes.push("tile-new");
        this.applyClasses(wrapper, classes);
    }

    // Add the inner part of the tile to the wrapper
    wrapper.appendChild(inner);

    // Put the tile on the board
    this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
    element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
    return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
    position = this.normalizePosition(position);
    return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
    this.clearContainer(this.scoreContainer);

    var difference = score - this.score;
    this.score = score;

    this.scoreContainer.textContent = this.score;

    if (difference > 0) {
        var addition = document.createElement("div");
        addition.classList.add("score-addition");
        addition.textContent = "+" + difference;

        this.scoreContainer.appendChild(addition);
    }
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
    this.bestContainer.textContent = bestScore;
};

HTMLActuator.prototype.message = function (won) {
    var mytxt = new Array(11);
    mytxt[0] = "嘿咻~（恭喜获得最低分）";
    mytxt[1] = "Biu~“准备盖新房吧”";
    mytxt[2] = "我叫罗小白，请多多指教~";
    mytxt[3] = "哥哥你的嘲讽技能太强了";
    mytxt[4] = "山新，游戏高手";
    mytxt[5] = "皇受，你个吃货";
    mytxt[6] = "可爱的罗小黑上场啦！";
    mytxt[7] = "沉迷ACG无法自拔……";
    mytxt[8] = "罗小黑，灵力恢复！";
    mytxt[9] = "“我叫风息,我们是同类。”"
    mytxt[10] = "是无限大人！！！"

    var text3 = function (m) { var r = 0; while (m > 1) r++, m >>= 1; return r; }
    var type = won ? "game-won" : "game-over";
    var message = won ? "你成功地催更了木头233" : mytxt[text3(maxscore) - 2];

    if (typeof ga !== "undefined") {
        ga("send", "event", "game", "end", type, this.score);
    }

    this.messageContainer.classList.add(type);
    this.messageContainer.getElementsByTagName("p")[0].textContent = message;

    this.clearContainer(this.sharingContainer);
};

HTMLActuator.prototype.clearMessage = function () {
    // IE only takes one value to remove at a time.
    this.messageContainer.classList.remove("game-won");
    this.messageContainer.classList.remove("game-over");
};

HTMLActuator.prototype.scoreTweetButton = function () {
    var tweet = document.createElement("a");
    tweet.classList.add("twitter-share-button");
    tweet.setAttribute("href", "https://twitter.com/share");
    tweet.setAttribute("data-via", "oprilzeng");
    tweet.setAttribute("data-url", "http://oprilzeng.github.io/2048");
    tweet.setAttribute("data-counturl", "http://oprilzeng.github.io/2048/");
    tweet.textContent = "Tweet";

    var text = "I scored " + this.score + " points at PRC2048, a game where you " +
        "join numbers to score high! #PRC2048";
    tweet.setAttribute("data-text", text);

    return tweet;
};
