require("override-lib/library").block(MemoryBlock, {
	ldbSlideVal : 4,
	ldbRangeStr : "0-511",
	ldbRangeArr : [],
	ldbEditMem: false,
	ldbMinWidth : 0,
	ldbColMul : 0,

	buildConfiguration(table) {
		const updatePane = function(that) {
			paneCell.get().setWidget(that.ldbSetTable(paneCell.get().getWidget()));
		}
		const setWidth = function(that) {
			if (that.ldbEditMem) {
				that.ldbMinWidth = 400;
				that.ldbColMul = 200;
			} else {
				that.ldbMinWidth = 400;
				that.ldbColMul = 200;
			}
		}
		const height = 500;
		setWidth(this);
		let colMul = this.ldbColMul;
		let minWidth = this.ldbMinWidth;
		this.ldbParseRange(this.ldbRangeStr);

		table.background(Styles.black6);

		let c = table.check("", v => {
			this.ldbEditMem = v; 
			setWidth(this);
			updatePane(this); 
		}).size(40).right().pad(10);
		c.get().setChecked(this.ldbEditMem);
		global.ldbTipNo("edit", c);

		table.table(null, table => {
			table.slider(1, 32, 1, this.ldbSlideVal, true, v => {
				this.ldbSlideVal = v;
				updatePane(this);
				paneCell.size(Math.max(this.ldbMinWidth, colMul * this.ldbSlideVal), height);
			}).left().width(minWidth - 50).get().moved(v => this.ldbSlideVal = v);
			table.label(() => "" + this.ldbSlideVal).right().pad(10).get().alignment = Align.right;
		}).width(minWidth).pad(10).right().tooltip("columns");
		if (this.ldbSlideVal <= 3) { table.row(); }

		let f = table.field(this.ldbRangeStr, v => {
			this.ldbRangeStr = v;
			this.ldbParseRange(v);
			updatePane(this);
		}).width(minWidth).pad(10).left().tooltip("ranges");
		if (this.ldbSlideVal <= 3) { f.colspan(2); }
		table.row();

		const paneCell = table.pane(tableInPane => this.ldbSetTable(tableInPane))
			.size(Math.max(minWidth, colMul * this.ldbSlideVal), height)
			.pad(10).colspan(3);
		paneCell.get().setOverscroll(false, false);
		paneCell.get().setSmoothScrolling(false);
	},

	ldbSetTable(table) {
		table.clearChildren();
		table.top();
		let cnt = 0;
		for (var i in this.memory) {
			if (this.ldbRangeArr.indexOf(i) == -1) { continue; }

			const index = i;
			const value = () => "" + this.memory[index];

			if (cnt % this.ldbSlideVal) {
				table.add(" [gray]|[] ");
			} else {
				table.row();
			}

			table.add("[accent]#" + i).left().width(60).get().alignment = Align.left;
			if (this.ldbEditMem) {
				const cell = table.field(value(), v => {
					let listens = cell.get().getListeners();
					listens.remove(listens.size - 1);
					this.memory[index] = parseInt(v);
					cell.tooltip((v => v + ", " + v.length)("" + this.memory[index]));
				}).width(this.ldbColMul - 80).right()
					.tooltip((v => v + ", " + v.length)("" + this.memory[i]));
			} else {
				table.label(value).width(this.ldbColMul - 80).maxSize(Number.NEGATIVE_INFINITY)
					.right().get().alignment = Align.right;
			}

			cnt++;
		}
		return table;
	},

	ldbParseRange(str) {
		const range = function(start, cnt) {
			return Array.apply(0, Array(cnt)).map((_, i) => "" + (start + i));
		};
		this.ldbRangeArr = [];
		str.split(",").forEach(e => {
			let split = e.split("-");
			if (split.length == 1) {
				let s = parseInt(split[0]);
				if (!isNaN(s)) {
					this.ldbRangeArr.push("" + s);
				}
			} else
			if (split.length == 2) {
				let s = parseInt(split[0]);
				let e = parseInt(split[1]);
				if (!isNaN(s)) {
					if(isNaN(e)) {
						e = 511;
					}
					if (s > e) {
						let t = e;
						e = s;
						s = t;
					}
					this.ldbRangeArr = this.ldbRangeArr.concat(range(s, e - s + 1));
				}
			}
		});
		if (this.ldbRangeArr.length == 0) {
			this.ldbParseRange("0-511");
		}
	}

}, block => {
	block.configurable = true;
});
