declare module "react-signature-canvas" {
  import * as React from "react";

  interface SignatureCanvasProps {
    penColor?: string;
    canvasProps?: React.CanvasHTMLAttributes<HTMLCanvasElement>;
    clearOnResize?: boolean;
    backgroundColor?: string;
  }

  class SignatureCanvas extends React.Component<SignatureCanvasProps> {
    clear(): void;
    toDataURL(type?: string, encoderOptions?: number): string;
    fromDataURL(dataURL: string, options?: any): void;
    getTrimmedCanvas(): HTMLCanvasElement;
  }

  export default SignatureCanvas;
}
