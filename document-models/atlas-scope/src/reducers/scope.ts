/**
 * This is a scaffold file meant for customization:
 * - modify it by implementing the reducer functions
 * - delete the file and run the code generator again to have it reset
 */

import { AtlasScopeScopeOperations } from "../../gen/scope/operations";
import { Status, GlobalTag } from "../../gen/schema";

export const reducer: AtlasScopeScopeOperations = {
  updateScopeOperation(state, action, dispatch) {
    // Update name if provided
    if (action.input.name !== undefined) {
      state.name = action.input.name;
    }

    // Update docNo if provided
    if (action.input.docNo !== undefined) {
      state.docNo = action.input.docNo;
    }

    // Update content if provided
    if (action.input.content !== undefined) {
      state.content = action.input.content;
    }

    // Update masterStatus if provided
    if (action.input.masterStatus) {
      state.masterStatus = action.input.masterStatus;
    }

    // Update globalTags if provided
    if (action.input.globalTags) {
      // Convert string array to GlobalTag array
      state.globalTags = action.input.globalTags.map(tag => tag as GlobalTag);
    }

    // Update originalContextData if provided
    if (action.input.originalContextData) {
      state.originalContextData = action.input.originalContextData;
    }

    // Update provenance if provided
    if (action.input.provenance !== undefined) {
      state.provenance = action.input.provenance;
    }
  },
};
