require("override-lib/library").block(MemoryBlock, {
	buildConfiguration(table) {
		table.background(Styles.black6);
		table.pane(pane => {
			for (var i in this.memory) {
				const index = i;
				const value = () => "" + this.memory[index];

				pane.add("#" + i).left().get().alignment = Align.left;
				pane.label(value).growX().get().alignment = Align.right;
				pane.row();
			}
		}).size(200, 200).pad(10);
	}
}, block => {
	block.configurable = true;
});
