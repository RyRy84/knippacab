/**
 * Navigation type definitions
 *
 * Defines the parameter list for each screen in the navigation stack.
 * This provides type safety for navigation props throughout the app.
 */

export type RootStackParamList = {
  Home: undefined;
  ProjectSetup: undefined;
  CabinetBuilder: undefined;
  DrawerBuilder: { cabinetId: string };
  ReviewEdit: undefined;
  CuttingPlan: undefined;
  VisualDiagram: undefined;
  CalculatorDemo: undefined;
};
