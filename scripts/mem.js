module.exports = block => {
	const build = block.newBuilding().class;
	block.configurable = true;
	block.buildType = () => extendContent(build, block, {
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
	});
};
