require("override-lib/library").block(MemoryBlock, {
	ldbSlideVal : 4,
	ldbRangeStr : "0-511",
	ldbRangeArr : [],
	ldbEditMem: false,

	buildConfiguration(table) {
		table.background(Styles.black6);

		const height = 500;
		let minWidth = 300;
		let colMul = 100;
		if (this.ldbEditMem) {
			minWidth = 400;
			colMul = 140;
		}

		this.ldbParseRange(this.ldbRangeStr);

		const updatePane = function(thiss) {
			paneCell.get().setWidget(thiss.ldbSetTable(paneCell.get().getWidget()));
		}
		table.check("", v => {
			this.ldbEditMem = v; 
			if (v) {
				minWidth = 400; colMul = 140;
			} else {
			 	minWidth = 300; colMul = 100;
			}
			updatePane(this); 
		}).size(40).left().pad(10).tooltip("edit").get().setChecked(this.ldbEditMem);
		table.pane(tableInPane => {
			tableInPane.slider(1, 32, 1, this.ldbSlideVal, true, v => {
				this.ldbSlideVal = v;
				updatePane(this);
				paneCell.size(Math.max(minWidth, colMul * this.ldbSlideVal), height);
			}).left().width(minWidth - 50).get().moved(v => this.ldbSlideVal = v);
			tableInPane.label(() => "" + this.ldbSlideVal).right().pad(10).get().alignment = Align.right;
		}).width(minWidth).pad(10).right().tooltip("columns");
		if (this.ldbSlideVal <= 4) { table.row(); }

		let f = table.field(this.ldbRangeStr, v => {
			this.ldbRangeStr = v;
			this.ldbParseRange(v);
			updatePane(this);
		}).width(minWidth).pad(10).left().tooltip("ranges");
		if (this.ldbSlideVal <= 4) { f.colspan(2); }
		table.row();

		const paneCell = table.pane(tableInPane => this.ldbSetTable(tableInPane))
			.size(Math.max(minWidth, colMul * this.ldbSlideVal), height)
			.pad(10).colspan(3);
		paneCell.get().setOverscroll(false, false);
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
				table.add(" [gray]|[]  ");
			} else {
				table.row();
			}

			table.add("[accent]#" + i).left().get().alignment = Align.left;
			if (this.ldbEditMem) {
				table.field(value(), v => this.memory[index] = parseInt(v)).left().width(60);
			} else {
				table.label(value).right().get().alignment = Align.right;
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
