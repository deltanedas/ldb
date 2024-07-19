const padCf = val => {
	const str = val.toString(16);
	return "0".repeat(6 - str.length) + str.toUpperCase();
};

global.override.block(LogicDisplay, {
	ldbColor: Color.valueOf("#565656"),
	sliders: {},
	fields: {},
	// locks to prevent endless loop
	ldbSetAll: false,
	ldbSetChannel: false,

	buildConfiguration(table) {
		const setAll = (val, field) => {
			if (this.ldbSetAll) return;

			if (!isNaN(val) && 0 <= val && val <= 0xFFFFFF) {
				this.ldbColor.rgb888(val);

				this.ldbSetAll = true;
				if (field) {
					cs.value = val;
				} else {
					cf.text = padCf(val);
				}
				this.ldbSetAll = false;

				this.ldbSetChannel = true;
				setChannel(this.ldbColor.r * 255, "r", true, true);
				setChannel(this.ldbColor.g * 255, "g", true, true);
				setChannel(this.ldbColor.b * 255, "b", true, true);
				this.ldbSetChannel = false;
			}
		};

		const setChannel = (val, chan, slider, field) => {
			if (!isNaN(val) && 0 <= val && val <= 255) {
				this.ldbColor[chan] = val / 255;

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
					const color = this.ldbColor.rgb888();
					cs.value = color;
					cf.text = padCf(color);
					this.ldbSetAll = false;
				}
			}
		};

		table.background(Styles.black6);

		global.ldbTipNo("Clear screen",
			table.button(Icon.eraser, Styles.clearTogglei, () => {
				// add "draw clear R G B" to the display's command buffer
				const r = this.ldbColor.r * 255,
					g = this.ldbColor.g * 255,
					b = this.ldbColor.b * 255;
				this.commands.addLast(DisplayCmd.get(LogicDisplay.commandClear,
					r, g, b, 0, 0, 0));
			}).size(40).pad(10)
		);

		const color = this.ldbColor.rgb888();
		const cs = table.slider(0, 0xFFFFFF, 1, color, v => setAll(v, false)).padRight(10).get();
		const cf = table.field(padCf(color), v => setAll(parseInt(v, 16), true)).padRight(10).get();
		table.row();

		const channel = (color, chan) => {
			const value = Math.floor(this.ldbColor[chan] * 255);
			table.add(color + chan.toUpperCase() + " ");
			this.sliders[chan] = table.slider(0, 0xFF, 1, value, v => setChannel(v, chan, false, true)).padRight(10).get();
			this.fields[chan] = table.field(value + "", v => setChannel(parseInt(v), chan, true, false)).padRight(10).get();
			table.row();
		};

		channel("[red]", "r");
		channel("[green]", "g");
		channel("[blue]", "b");

		table.table(null, t => {
			const img = new Image();
			img.update(() => img.color = this.ldbColor);
			t.add(img).height(50).width(300);
		}).colspan(3).pad(10);
	}
}, block => {
	block.configurable = true;
});
