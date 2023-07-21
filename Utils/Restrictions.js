function  checkRestrictions(userEmail) {
    // if restrictions are set, restrict datatable to employees team selected in TEAMNAME
    if (this.TEAMNAMES) {
        const agentObj = EmailToWFM.getAgentObj(userEmail);
                // Logger.log(agentObj);

        const TEAMNAME = agentObj["Team"];
                            // Logger.log(TEAMNAME);

        // Checks WFM Raw_Data for a row containing active users email in Column AD and TEAMNAME in Column C
        if(!this.TEAMNAMES.includes(TEAMNAME)) {
            throw new Error(`User not associated with team: ${TEAMNAME}`); // Throw error message if user isn't on team in TEAMNAME.
        }
    };
  }