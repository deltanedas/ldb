const padCf = val => {
	const str = val.toString(16);
	return "0".repeat(6 - str.length) + str.toUpperCase();
};

global.override.block(LogicDisplay, {
	ldbColour: Color.valueOf("#565656"),
	sliders: {},
	fields: {},
	// locks to prevent endless loop
	ldbSetAll : false,
	ldbSetChannel : false,

	buildConfiguration(table) {
		const setAll = (val, field) => {
			if (this.ldbSetAll) return;

			if (!isNaN(val) && 0 <= val && val <= 0xFFFFFF) {
				this.ldbColour.rgb888(val);

				this.ldbSetAll = true;
				if (field) {
					cs.value = val;
				} else {
					cf.text = padCf(val);
				}
				this.ldbSetAll = false;

				this.ldbSetChannel = true;
				setChannel(this.ldbColour.r, "r", true, true);
				setChannel(this.ldbColour.g, "g", true, true);
				setChannel(this.ldbColour.b, "b", true, true);
				this.ldbSetChannel = false;
			}
		};

		const setChannel = (val, chan, slider, field) => {
			if (!isNaN(val) && 0 <= val && val <= 255) {
				val /= 255;
				this.ldbColour[chan] = val;

				this.ldbSetChannel = true;
				if (slider) {
					this.sliders[chan].value = val;
				}
				if (field) {
					this.fields[chan].text = val;
				}
				this.ldbSetChannel = false;

				if (!this.ldbSetChannel) {
					this.ldbSetAll = true;
					const colour = this.ldbColour.rgb888();
					cs.value = colour;
					cf.text = padCf(colour);
					this.ldbSetAll = false;
				}
			}
		};

		table.background(Styles.black6);

		global.ldbTipNo("Clear screen",
			table.button(Icon.eraser, Styles.clearTransi, () => {
				// add "draw clear R G B" to the display's command buffer
				const r = this.ldbColour.a * 255,
					g = this.ldbColour.g * 255,
					b = this.ldbColour.b * 255;
				this.commands.addLast(DisplayCmd.get(0, r, g, b, 0, 0, 0));
			}).size(40).pad(10)
		);

		const colour = this.ldbColour.rgb888();
		const cs = table.slider(0, 0xFFFFFF, 1, colour, v => setAll(v, false)).padRight(10).get();
		const cf = table.field(padCf(colour), v => setAll(parseInt(v, 16), true)).padRight(10).get();
		table.row();

		const channel = (colour, chan) => {
			const value = this.ldbColour[chan];
			table.add(`[${colour}]${chan.toUpperCase()} `);
			this.sliders[chan] = table.slider(0, 0xFF, 1, value, v => setChannel(v, chan, false, true)).padRight(10).get();
			this.fields[chan] = table.field((value * 255) + "", v => setChannel(parseInt(v), chan, true, false)).padRight(10).get();
			table.row();
		};

		channel("red", "r");
		channel("green", "g");
		channel("blue", "b");

		table.table(null, t => {
			const img = new Image();
			img.update(() => img.color = this.ldbColour);
			t.add(img).height(50).width(300);
		}).colspan(3).pad(10);
	}
}, block => {
	block.configurable = true;
});
