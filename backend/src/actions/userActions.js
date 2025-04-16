export const setUserData = (email, password, role) => {
    return {
      type: "SET_USER_DATA",
      payload: { email, password, role },
    };
  };
  
  export const setProfileData = (profileData) => {
    return {
      type: "SET_PROFILE_DATA",
      payload: profileData,
    };
  };
  
  export const resetUserData = () => {
    return {
      type: "RESET_USER_DATA",
    };
  };
  