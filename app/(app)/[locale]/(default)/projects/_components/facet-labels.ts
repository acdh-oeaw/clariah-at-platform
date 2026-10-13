export function getFacetLabel(value: string): string {
	let label = "";
	switch (value) {
		case "go_digital_1_0": {
			label = "Go!Digital 1.0";
			break;
		}
		case "go_digital_2_0": {
			label = "Go!Digital 2.0";
			break;
		}
		case "go_digital_3_0": {
			label = "Go!Digital 3.0";
			break;
		}
		case "go_digital_next_generation": {
			label = "Go!digital Next Generation";
			break;
		}
	}
	return label;
}
