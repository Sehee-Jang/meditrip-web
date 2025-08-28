// import { Input } from "@/components/ui/input";
// import React from "react";
// import { Controller } from "react-hook-form";

// export default function DoctorsField({ control }: { control: Control<ClinicFormInput> }) {
//     const { fields, append, remove } = useFieldArray({
//       control,
//       name: "doctors",
//     });

//     const addOne = () =>
//       append({
//         name: { ko: "", ja: "" }, // 필요시 zh/en 확장 가능
//         photoUrl: "",
//         lines: { ko: [""], ja: [""] },
//       });

//     return (
//       <div className='space-y-4 px-5 py-4'>
//         {fields.map((f, i) => (
//           <div key={f.id} className='rounded-md border p-4 space-y-3'>
//             <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
//               <Controller
//                 control={control}
//                 name={`doctors.${i}.photoUrl` as Path<ClinicFormInput>}
//                 render={({ field }) => (
//                   <Input {...field} placeholder='사진 URL (https://...)' />
//                 )}
//               />
//               <div />
//               <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
//                 <Controller
//                   control={control}
//                   name={`doctors.${i}.name.ko` as Path<ClinicFormInput>}
//                   render={({ field }) => (
//                     <Input {...field} placeholder='이름(한국어)' />
//                   )}
//                 />
//                 <Controller
//                   control={control}
//                   name={`doctors.${i}.name.ja` as Path<ClinicFormInput>}
//                   render={({ field }) => (
//                     <Input {...field} placeholder='氏名(日本語)' />
//                   )}
//                 />
//               </div>
//             </div>

//             <LocalizedRepeaterField
//               control={control}
//               nameKo={`doctors.${i}.lines.ko` as Path<ClinicFormInput>}
//               nameJa={`doctors.${i}.lines.ja` as Path<ClinicFormInput>}
//               addLabel='경력/소개 추가'
//               removeLabel='삭제'
//               placeholderKo='예) Barral Institute 수료'
//               placeholderJa='例) Barral Institute 修了'
//             />

//             <div className='flex justify-end'>
//               <Button type='button' variant='ghost' onClick={() => remove(i)}>
//                 의료진 제거
//               </Button>
//             </div>
//           </div>
//         ))}
//         <Button type='button' variant='outline' onClick={addOne}>
//           의료진 추가
//         </Button>
//       </div>
//     );
//   }
//   return <div>DoctorsField</div>;
// }
