export const changeCheckboxState = (checkboxes, checkedBoxes: string[]) => {
  if (checkboxes?.length && checkedBoxes?.length) {
    checkboxes.forEach((box) => {
      box.checked = checkedBoxes.includes(box.id);
    });
  }
};
