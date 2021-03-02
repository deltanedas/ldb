global.override.block(LogicDisplay, {
	ldbR : 0x56,
	ldbG : 0x56,
	ldbB : 0x66,
	ldbC : 0x565666,
	ldbSetC : [false],
	ldbSetO : [false],

	c2rgb() {
		this.ldbR = (this.ldbC >> 16) & 0xFF;
		this.ldbG = (this.ldbC >>  8) & 0xFF;
		this.ldbB = (this.ldbC >>  0) & 0xFF;
	},
	rgb2c() {
		this.ldbC =
			((this.ldbR & 0xFF) << 16) +
			((this.ldbG & 0xFF) <<  8) +
			((this.ldbB & 0xFF) <<  0);
	},
	buildConfiguration(table) {
		const padCf = function(val) {
			let str = val.toString(16);
			return "0".repeat(6 - str.length) + str.toUpperCase();
		}
		const peek = function(arr) {
			let v = arr.pop();
			arr.push(v);
			return v;
		}
		const setC = function(val, field, that) {
			if (peek(that.ldbSetC)) { return; }

			if(!isNaN(val) && 0 <= val && val <= 0xFFFFFF) {
				that.ldbC = val;
				that.c2rgb();

				that.ldbSetC.push(true);
				if (field) {
					cs.setValue(val);
				} else {
					cf.setText(padCf(val));
				}
				that.ldbSetC.pop();

				that.ldbSetO.push(true);
				setO(that.ldbR, "R", NaN, that);
				setO(that.ldbG, "G", NaN, that);
				setO(that.ldbB, "B", NaN, that);
				that.ldbSetO.pop();
			}
		}
		const setO = function(val, rgb, field, that) {
			if(!isNaN(val) && 0 <= val && val <= 255) {
				eval("that.ldb" + rgb + " = val");

				that.ldbSetO.push(true);
				if(!field || isNaN(field)) {
					eval(rgb.toLowerCase() + "f.setText(" + val + ")");
				}
				if(field || isNaN(field)) {
					eval(rgb.toLowerCase() + "s.setValue(" + val + ")");
				}
				that.ldbSetO.pop();

				if (!peek(that.ldbSetO)) {
					that.rgb2c();
					that.ldbSetC.push(true);
					cs.setValue(that.ldbC);
					cf.setText(padCf(that.ldbC));
					that.ldbSetC.pop();
				}
			}
		}

		table.background(Styles.black6);

		global.ldbTipNo("clear screen",
			table.button(Icon.eraser, Styles.clearTransi, () => {
				this.commands.addLast(DisplayCmd.get(0, this.ldbR, this.ldbG, this.ldbB, 0, 0, 0));
			}).size(40).pad(10)
		);

		const cs = table.slider(0, 0xFFFFFF, 1, this.ldbC, v => setC(v, false, this)).padRight(10).get();
		const cf = table.field(padCf(this.ldbC), v => setC(parseInt(v, 16), true, this)).padRight(10).get();
		table.row();

		table.add("[red]R ");
		const rs = table.slider(0, 0xFF, 1, this.ldbR, v => setO(v, "R", false, this)).padRight(10).get();
		const rf = table.field(this.ldbR + "", v => setO(parseInt(v), "R", true, this)).padRight(10).get();
		table.row();

		table.add("[green]G ");
		const gs = table.slider(0, 0xFF, 1, this.ldbG, v => setO(v, "G", false, this)).padRight(10).get();
		const gf = table.field(this.ldbG + "", v => setO(parseInt(v), "G", true, this)).padRight(10).get();
		table.row();

		table.add("[blue]B ");
		const bs = table.slider(0, 0xFF, 1, this.ldbB, v => setO(v, "B", false, this)).padRight(10).get();
		const bf = table.field(this.ldbB + "", v => setO(parseInt(v), "B", true, this)).padRight(10).get();
		table.row();

		table.table(null, i => {
			const img = new Image();
			img.update(() => img.setColor(new Color((this.ldbC << 8) + 0xFF)));
			i.add(img).height(50).width(300);
		}).colspan(3).pad(10);
	}
}, block => {
	block.configurable = true;
});
