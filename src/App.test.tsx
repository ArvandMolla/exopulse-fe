import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";
import { configure } from "@testing-library/dom";
configure({ testIdAttribute: "class" });

test("renders learn react link", (done) => {
  render(<App />);

  // performing the fetch here...

  setTimeout(() => {
    const elements = screen.getAllByTestId("passedevent");
    console.log(elements);

    elements.forEach((element) => {
      expect(element).toBeInTheDocument();
      // expect(element.innerHTML).toBe(events[2].description);

      expect(element).toHaveClass("incomingevent");
    });
    done();
  }, 500);
});
