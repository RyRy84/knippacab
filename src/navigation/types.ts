/**
 * Navigation type definitions
 *
 * Defines the parameter list for each screen in the navigation stack.
 * This provides type safety for navigation props throughout the app.
 */

export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  ProjectSetup: undefined;
  CabinetBuilder: { cabinetId?: string } | undefined;
  DrawerBuilder: { cabinetId: string };
  ReviewEdit: undefined;
  CuttingPlan: undefined;
  VisualDiagram: undefined;
  CalculatorDemo: undefined;
};
