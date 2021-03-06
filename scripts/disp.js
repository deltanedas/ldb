const padColour = val => {
	const str = val.toString(16);
	return "0".repeat(6 - str.length) + str.toUpperCase();
};
const peek = function(arr) {
	return arr[arr.length - 1];
};

global.override.block(LogicDisplay, {
	ldbColour: { c : 0x565666, r : 0x56, g : 0x56, b : 0x66},
	fields: {},
	sliders: {},
	// locks to prevent recursive setting
	ldbSetAll : [false],
	ldbSetChannel : [false],

	c2rgb(val) {
		this.ldbColour.c = val;
		this.ldbColour.r = (this.ldbColour.c >> 16) & 0xFF;
		this.ldbColour.g = (this.ldbColour.c >>  8) & 0xFF;
		this.ldbColour.b = (this.ldbColour.c >>  0) & 0xFF;
	},
	rgb2c() {
		let val =
			((this.ldbColour.r & 0xFF) << 16) +
			((this.ldbColour.g & 0xFF) <<  8) +
			((this.ldbColour.b & 0xFF) <<  0);
		this.ldbColour.c = val;
		return val;
	},

	buildConfiguration(table) {
		const setAll = (val, field) => {
			if (peek(this.ldbSetAll)) return;

			if (!isNaN(val) && 0 <= val && val <= 0xFFFFFF) {

				this.ldbSetAll.push(true);
				if (field) {
					cs.value = val;
				} else {
					cf.text = padColour(val);
				}
				this.ldbSetAll.pop();

				this.c2rgb(val);
				this.ldbSetChannel.push(true);
				setChannel(this.ldbColour.r, "r", true, true);
				setChannel(this.ldbColour.g, "g", true, true);
				setChannel(this.ldbColour.b, "b", true, true);
				this.ldbSetChannel.pop();
			}
		};

		const setChannel = (val, chan, slider, field) => {
			if (!isNaN(val) && 0 <= val && val <= 255) {
				this.ldbColour[chan] = val;

				this.ldbSetChannel.push(true);
				if (field) {
					this.fields[chan].text = val;
				}
				if (slider) {
					this.sliders[chan].value = val;
				}
				this.ldbSetChannel.pop();

				if (!peek(this.ldbSetChannel)) {
					this.ldbSetAll.push(true);
					const colour = this.rgb2c();
					cs.value = colour;
					cf.text = padColour(colour);
					this.ldbSetAll.pop();
				}
			}
		};

		table.background(Styles.black6);

		global.ldb.tipNo("Clear Screen",
			table.button(Icon.eraser, Styles.clearTransi, () => {
				// add "draw clear R G B" to the display's command buffer
				const r = this.ldbColour.r,
					g = this.ldbColour.g,
					b = this.ldbColour.b;
				this.commands.addLast(DisplayCmd.get(0, r, g, b, 0, 0, 0));
			}).size(40).pad(10)
		);

		const colour = this.ldbColour.c;
		const cs = table.slider(0, 0xFFFFFF, 1, colour, v => setAll(v, false)).padRight(10).get();
		const cf = table.field(padColour(colour), v => setAll(parseInt(v, 16), true)).padRight(10).get();
		table.row();

		const channel = (colour) => {
			let chan = colour[0];
			const value = this.ldbColour[chan];
			table.add("[" + colour + "]" + chan.toUpperCase());
			this.sliders[chan] = table.slider(0, 0xFF, 1, value, v => setChannel(v, chan, false, true)).padRight(10).get();
			this.fields[chan] = table.field(value + "", v => setChannel(parseInt(v), chan, true, false)).padRight(10).get();
			table.row();
		};

		channel("red"  );
		channel("green");
		channel("blue" );

		table.table(null, t => {
			const img = new Image();
			img.color = new Color();
			img.update(() => img.color.rgb888(this.ldbColour.c));
			t.add(img).height(50).width(300);
		}).colspan(3).pad(10);
	}
}, block => {
	block.configurable = true;
});
