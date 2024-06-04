import React from "react";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import { Chip } from "@mui/material";


interface ProgramType {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  startTime: string;
  endTime: string;
  location: string;
}

interface StatusFormProps {
  program: ProgramType | null;
}




const FormStatus: React.FC<StatusFormProps> = ({ program }) => {
  const { data: sessionData } = useSession();
  const getStatusEachProgramByVolunteer = api.formInfo.getStatusEachProgramByVolunteer.useQuery ({ volunteerId: sessionData?.user?.id ?? "", programId: program?.id ?? "" });

  return (
    <>
    {getStatusEachProgramByVolunteer.data === "APPROVED" && (
      <>
      <Chip label="APPROVED" color="success" />
      </>
    )}
    {getStatusEachProgramByVolunteer.data === "SUBMITTED" && (
      <>
        <Chip label="SUBMITTED" color="warning" />
      </>
    )}
    {getStatusEachProgramByVolunteer.data === "REJECTED" && (
      <>
        <Chip  label="REJECTED" color="error" />
      </>
    )}
    {getStatusEachProgramByVolunteer.data === null && (
      <>
        <Chip  label="NOT SUBMITTED" color="info" />
        </>
      )}

    </>

  );
};

export default FormStatus;
