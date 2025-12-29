import api from "./api";

export const addEmployee = (employee) => {
  return api.post("/Employee", employee);
};
