import "react";

declare module "react" {
  interface HTMLAttributes<T> {
    /** Experimental declarative WebMCP tool identifier. */
    toolname?: string;
    /** Experimental declarative WebMCP description of a tool's purpose. */
    tooldescription?: string;
    /** Experimental declarative WebMCP description of a form parameter. */
    toolparamdescription?: string;
  }
}

export {};
