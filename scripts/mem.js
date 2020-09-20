// TODO: iterate Vars.content.blocks() when client loads for modded cell support
const override = block => {
	const build = block.newBuilding().class;
	block.configurable = true;
	block.buildType = () => extendContent(build, block, {
		buildConfiguration(table) {
			table.pane(pane => {
				for (var i in this.memory) {
					const value = () => "" + this.memory[i];
					pane.add("#" + i);
					pane.label(value).growX().get().alignment = Align.right;
					pane.row();
				}
			}).size(150, 200);
		}
	});
};

Events.on(ClientLoadEvent, () => {
	const blocks = Vars.content.blocks().items;
	for (var block of blocks) {
		if (block instanceof MemoryBlock) {
			print("hh" + block)
			override(block);
		}
	}
});
