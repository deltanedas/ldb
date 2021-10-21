require("override-lib/library").block(MemoryBlock, {
	ldbSlideVal: 4,
	ldbRangeStr: "0-511",
	ldbRangeArr: [],
	ldbEditMem: false,
	ldbMinWidth: 0,
	ldbColMul: 0,

	ldbShowCell(index) {
		return (this.ldbRangeArr.indexOf(index) != -1) ||
			(this.ldbFilterIn(parseInt(index), this.memory)());
	},
	ldbFilterIn: null,

	buildConfiguration(table) {
		const updatePane = function(upSize, that) {
			const table = pane.getWidget();
			table.clearChildren();
			table = that.ldbSetTable(table);
			pane.setWidget(table);
			if (upSize) {
				paneCell.minWidth(Math.max(that.ldbMinWidth, that.ldbColMul * that.ldbSlideVal));
			}
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
		setWidth(this);
		const height = 500;
		const minWidth = this.ldbMinWidth;
		if (this.ldbFilterIn === null) {
			this.ldbFilterIn = () => () => false;
		}
		this.ldbParseRange(this.ldbRangeStr);

		table.background(Styles.black6);

		const c = table.check("", v => {
			this.ldbEditMem = v;
			setWidth(this);
			updatePane(true, this);
		}).size(40).right().pad(10);
		c.get().setChecked(this.ldbEditMem);
		global.ldbTipNo("edit", c);

		table.table(null, table => {
			table.slider(1, 32, 1, this.ldbSlideVal, true, v => {
				this.ldbSlideVal = v;
				updatePane(true, this);
			}).left().width(minWidth - 50).get().moved(v => this.ldbSlideVal = v);
			table.label(() => this.ldbSlideVal + "").right().pad(10).get().alignment = Align.right;
		}).width(minWidth).pad(10).right().tooltip("columns");
		if (this.ldbSlideVal <= 3) table.row();

		const f = table.field(this.ldbRangeStr, v => {
			this.ldbRangeStr = v;
			this.ldbParseRange(v);
			updatePane(false, this);
		}).width(minWidth).pad(10).left()
			.tooltip("ranges: start-end-step\n\n" +
				"filters: JS function(idx, mem[[])\n" +
				"don't change or specify parms");
		if (this.ldbSlideVal <= 3) f.colspan(2);
		table.row();

		const paneCell = table.pane(table => table.top()).height(height).pad(10).left().colspan(4);
		const pane = paneCell.get();
		pane.setOverscroll(false, false);
		pane.setSmoothScrolling(false);
		updatePane(true, this);
	},

	ldbSetTable(table) {
		let count = 0;
		for (var i in this.memory) {
			if (!this.ldbShowCell(i)) continue;

			if (count % this.ldbSlideVal) {
				table.add(" [gray]|[] ");
			} else {
				table.row();
			}

			table.add("[accent]#" + i).left().width(60).get().alignment = Align.left;

			const index = i;
			let lastTime1 = 0, lastTime2 = 0;
			let lastVal = this.memory[index];
			let lastColor = 0; /* [], [red], [green] */
			const upVal = () => {
				let val = this.memory[index];
				if (val != lastVal) {
					lastVal = val;
					lastTime1 = Time.time + 5;
					lastTime2 = lastTime1 + 15;
					return "[red]" + val;
				}

				if(lastTime1 >= Time.time) {
					return null;
				}

				if (lastTime2 >= Time.time) {
					if (lastColor == 2) {
						return null;
					}

					lastColor = 2;
					return "[green]" + val;
				}

				if (lastColor == 0) {
					return null;
				}

				lastColor = 0;
				return val + "";
			}

			let min = Math.max(this.ldbMinWidth, this.ldbColMul * this.ldbSlideVal);
			min = min / this.ldbSlideVal - 90;
			if (this.ldbEditMem) {
				const cell = table.field(lastVal, v => {
					let listens = cell.get().getListeners();
					listens.remove(listens.size - 1);
					this.memory[index] = parseFloat(v);
					cell.tooltip((v => v + ", " + v.length)(this.memory[index] + ""));
				}).width(min).right().tooltip((v => v + ", " + v.length)(lastVal + ""));
			} else {
				const lbl = new Label(lastVal + "");
				lbl.alignment = Align.right;
				table.add(lbl).minWidth(min).right();
				lbl.update(() => {
					let val = upVal();
					if (!(val === null)) {
						lbl.setText(val);
					}
				});
			}

			count++;
		}
		return table;
	},

	ldbParseRange(str) {
		const range = (start, count, step) => {
			if (isNaN(step) || !step) step = 1;
			return Array.apply(0, Array(Math.floor(count / step))).map((_, i) => (start + i * step) + "");
		};

		this.ldbRangeArr = [];
		if (str.indexOf("function") != -1 || (str.indexOf("=>") != -1)) {
			try {
				const code = "function(idx, mem) {" +
					"return " + str + ";" +
				"}";
				this.ldbFilterIn = eval(code);
				this.ldbFilterIn(NaN, [])();
				this.ldbFilterIn(null, [])();
				this.ldbFilterIn(undefined, [])();

				for (var i = 0; i < 512; i++) {
					this.ldbFilterIn(i, [])();
				}

				return;
			} catch(e) {
				this.ldbFilterIn = () => () => false;
				Log.err(e);
			}
		}
		str.split(",").forEach(e => {
			let split = e.split("-");
			if (split.length == 1) {
				let s = parseInt(split[0]);
				if (!isNaN(s)) {
					this.ldbRangeArr.push(s + "");
				}
			} else if (split.length >= 2) {
				let s = parseInt(split[0]);
				let e = parseInt(split[1]);
				let c = parseInt(split[2]);
				if (!isNaN(s)) {
					if(isNaN(e)) {
						e = 511;
					}
					if (s > e) {
						let t = e;
						e = s;
						s = t;
					}
					this.ldbRangeArr = this.ldbRangeArr.concat(range(s, e - s + 1, c));
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
