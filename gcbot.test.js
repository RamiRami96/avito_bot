const checkDifference = require("./helpers/checkDifference");

describe("checkDifference", () => {
  const oldData = [
    { link: "https://example.com/old1", title: "Old Card 1", price: "1000" },
    { link: "https://example.com/old2", title: "Old Card 2", price: "2000" },
  ];

  const newData = [
    { link: "https://example.com/old1", title: "Old Card 1", price: "1000" },
    { link: "https://example.com/new", title: "New Card", price: "3000" },
  ];

  it("should return the difference between two arrays of objects", () => {
    const expectedDifference = [
      { link: "https://example.com/new", title: "New Card", price: "3000" },
    ];
    const actualDifference = checkDifference(oldData, newData);
    expect(actualDifference).toEqual(expectedDifference);
  });

  it("should return an empty array if there is no difference", () => {
    const actualDifference = checkDifference(oldData, oldData);
    expect(actualDifference).toEqual([]);
  });
});
