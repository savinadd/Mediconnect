const initialState = {
    email: "",
    password: "",
    role: "patient",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    birthDate: "",
    governmentId: "",
    bloodType: "",
    height: "",
    weight: "",
    allergies: "",
  };
  
  const userReducer = (state = initialState, action) => {
    switch (action.type) {
      case "SET_USER_DATA":
        return { ...state, ...action.payload };
      case "SET_PROFILE_DATA":
        return { ...state, ...action.payload };
      case "RESET_USER_DATA":
        return initialState;
      default:
        return state;
    }
  };
  
  export default userReducer;
  