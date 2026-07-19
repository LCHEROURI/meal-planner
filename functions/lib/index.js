"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.regenerateRecipe = exports.generateMealPlan = void 0;
const admin = __importStar(require("firebase-admin"));
const https_1 = require("firebase-functions/v2/https");
const genkit_1 = require("./ai/genkit");
const v2_1 = require("firebase-functions/v2");
admin.initializeApp();
(0, v2_1.setGlobalOptions)({ maxInstances: 10 });
// Export genkit flows as callable Cloud Functions
exports.generateMealPlan = (0, https_1.onCallGenkit)({
    authPolicy: (auth) => {
        if (!auth?.uid) {
            throw new Error("User must be authenticated to generate a meal plan.");
        }
        return true;
    },
    cors: true,
    timeoutSeconds: 300, // Important for AI tasks
}, genkit_1.generateMealPlanFlow);
exports.regenerateRecipe = (0, https_1.onCallGenkit)({
    authPolicy: (auth) => {
        if (!auth?.uid) {
            throw new Error("User must be authenticated to regenerate a recipe.");
        }
        return true;
    },
    cors: true,
    timeoutSeconds: 120,
}, genkit_1.regenerateRecipeFlow);
//# sourceMappingURL=index.js.map