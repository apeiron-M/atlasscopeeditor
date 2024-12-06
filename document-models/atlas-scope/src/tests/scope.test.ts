/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */

import { generateMock } from "@powerhousedao/codegen";
import { utils as documentModelUtils } from "document-model/document";

import utils from "../../gen/utils";
import { z, UpdateScopeInput, Status, GlobalTag } from "../../gen/schema";
import { reducer } from "../../gen/reducer";
import * as creators from "../../gen/scope/creators";
import { AtlasScopeDocument } from "../../gen/types";

describe("Scope Operations", () => {
  let document: AtlasScopeDocument;

  beforeEach(() => {
    document = utils.createDocument();
  });

  it("should handle basic updateScope operation", () => {
    const input: UpdateScopeInput = {
      id: documentModelUtils.hashKey(),
      name: "Test Scope",
      docNo: "A.1",
      content: "Test content",
      masterStatus: [],
      originalContextData: [],
    };

    const updatedDocument = reducer(document, creators.updateScope(input));

    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].type).toBe("UPDATE_SCOPE");
    expect(updatedDocument.operations.global[0].input).toStrictEqual(input);
    expect(updatedDocument.operations.global[0].index).toEqual(0);
    expect(updatedDocument.state.global.name).toBe(input.name);
    expect(updatedDocument.state.global.docNo).toBe(input.docNo);
    expect(updatedDocument.state.global.content).toBe(input.content);
  });

  it("should handle updateScope with status and tags", () => {
    const input: UpdateScopeInput = {
      id: documentModelUtils.hashKey(),
      masterStatus: ["APPROVED", "PROVISIONAL"],
      globalTags: ["SCOPE_ADVISOR", "DAO_TOOLKIT"],
      originalContextData: [],
    };

    const updatedDocument = reducer(document, creators.updateScope(input));

    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.state.global.masterStatus).toEqual(input.masterStatus);
    expect(updatedDocument.state.global.globalTags).toEqual(input.globalTags);
  });

  it("should handle updateScope with originalContextData and provenance", () => {
    const input: UpdateScopeInput = {
      id: documentModelUtils.hashKey(),
      originalContextData: ["phid-1", "phid-2"],
      provenance: "https://example.com",
      masterStatus: [],
    };

    const updatedDocument = reducer(document, creators.updateScope(input));

    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.state.global.originalContextData).toEqual(input.originalContextData);
    expect(updatedDocument.state.global.provenance).toBe(input.provenance);
  });

  it("should handle partial updates", () => {
    const initialInput: UpdateScopeInput = {
      id: documentModelUtils.hashKey(),
      name: "Initial Name",
      docNo: "A.1",
      content: "Initial content",
      masterStatus: [],
      originalContextData: [],
    };

    let updatedDocument = reducer(document, creators.updateScope(initialInput));

    const partialInput: UpdateScopeInput = {
      id: initialInput.id,
      name: "Updated Name",
      masterStatus: [],
      originalContextData: [],
    };

    updatedDocument = reducer(updatedDocument, creators.updateScope(partialInput));

    expect(updatedDocument.operations.global).toHaveLength(2);
    expect(updatedDocument.state.global.name).toBe(partialInput.name);
    expect(updatedDocument.state.global.docNo).toBe(initialInput.docNo);
    expect(updatedDocument.state.global.content).toBe(initialInput.content);
  });

  it("should handle updateScope with all fields", () => {
    const input: UpdateScopeInput = generateMock(z.UpdateScopeInputSchema());
    const updatedDocument = reducer(document, creators.updateScope(input));

    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].type).toBe("UPDATE_SCOPE");
    expect(updatedDocument.operations.global[0].input).toStrictEqual(input);
    
    Object.keys(input).forEach(key => {
      if (key !== 'id') {
        expect(updatedDocument.state.global[key]).toEqual(input[key]);
      }
    });
  });
});
