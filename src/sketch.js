function runSimulator(simulator) {
	simulator
		.setEngineConfig((engineConf) => {
			engineConf.plotter.squareByX = true;
			engineConf.plotter.displayGrid = false;
			engineConf.plotter.scale = {
				x : 12,
				y : 12
			};
			engineConf.plotter.offset = {
				x : 12/2,
				y : 12/2 - 0.1 * 12/2
			};
		})
		.addObjects(Simulator, 1);
}
