import { describe, expect, it } from "vitest";
import { parseAcf } from "./acf";

describe("parseAcf", () => {
  it("finds Plane Maker object attachments and transforms", () => {
    const result = parseAcf("Seahawk.acf", `I
1200 Version
ACF
P acf/_obja/0/_obj_path objects/fuselage.obj
P acf/_obja/0/_v10_att_file_stl 1 2 3 10 20 30
P acf/_obja/0/_lighting 0
P acf/_obja/1/_obj_path "objects/cockpit glass.obj"
P acf/_obja/1/_lighting 2
`);
    expect(result.attachments).toHaveLength(2);
    expect(result.attachments[0]).toMatchObject({
      path: "objects/fuselage.obj",
      position: [1, 2, 3],
      rotation: [10, 20, 30],
      role: "exterior",
    });
    expect(result.attachments[1].role).toBe("glass");
  });
});
