<script>
  import { DialogOverlay, DialogContent } from 'svelte-accessible-dialog';
 import { createForm } from "svelte-forms-lib";
    import * as yup from "yup";
    import "yup-phone";
      import axios from 'axios';
let uname;
  let isOpen;
    let before = false;
  const open = () => {
    isOpen = true;
  };

  const close = () => {
    isOpen = false;
  };
let data;
let shgi = {st: false, msg: ""}
    const { form, errors, state, handleChange, handleSubmit } = createForm({
      initialValues: {
        name: "",
        email: "",
        phone: "",
        teur: ""
      },
      validationSchema: yup.object().shape({
          phone: yup.string().phone("IL").required(),
        name: yup.string().required(),
        email: yup
          .string()
          .email()
      }),
      onSubmit: values => {
       const mail = $form.email.toLowerCase()
  axios
  .post('https://yomuledet.onrender.com/api/rekamots', {
       data: {
     name: $form.name,
     email: mail,
     phone: $form.phone,
     teur: $form.teur
    },
 
  headers: {
        'Content-Type': 'application/json',
            }})
  .then(response => {
          data = response.data;
 
   isOpen = false;
   before = true;
   
              })
  .catch(error => {
      console.log(error);
    shgi.st = true;
    if (error.response === undefined){
        shgi.msg = "השרת נרדם 😴, הערנו אותו, נבצע ניסיון חוזר";
      //  handleSubmit();
    } else {
        shgi.msg = `${error.response.data.message}  ${error.response.data.statusCode} :טעות לעולם חוזרת, הנה הפרטים היבשים `
    }
          });

          }
    });
  </script>


<DialogOverlay {isOpen} onDismiss={close}>
  <DialogContent aria-label="form">
      <div class="tofes">
    <button class="bg-barb hover:bg-cachol text-cachol hover:text-barb p-2 rounded" on:click={close}>סגור</button>
<h1 class="text-barb text-center">השארת פרטים לקניית רקמה</h1>
 <form on:submit={handleSubmit} >
   

    <label for="name">שם</label>
    <input
      id="name"
      name="name"
      on:change={handleChange}
      on:blur={handleChange}
      bind:value={$form.name}
    />
    {#if $errors.name}
      <small>{$errors.name}</small>
    {/if}
    <br>
    <label for="phone">מספר טלפון</label>
    <input
      id="phone"
      name="phone"
      on:change={handleChange}
      on:blur={handleChange}
      bind:value={$form.phone}
    />
    {#if $errors.phone}
      <small>{$errors.phone}</small>
    {/if}
    <br>
    <label for="email">כתובת מייל</label>
    <input
      id="email"
      name="email"
      on:change={handleChange}
      on:blur={handleChange}
      bind:value={$form.email}
    />
    {#if $errors.email}
      <small>{$errors.email}</small>
    {/if}
<br>
 <label for="teur">תיאור</label>
    <input
      id="teur"
      name="teur"
      bind:value={$form.teur}
    />
   
    <br>
    <button on:submit={handleSubmit} class="bg-barb hover:bg-cachol text-cachol hover:text-barb p-4 rounded" type="submit">שליחת הטופס</button>
  </form>
{#if shgi.st == true}
<p>{shgi.msg}</p>
{/if}
</div>

</DialogContent>
</DialogOverlay>

<div class="body" >
    {#if before == false}
    <div class="pnimi bg-barb  text-center p-4 m-4">
<h1 class="text-white text-xl text-center">קעקועים רקומים</h1>
<p class="text-center text-sm text-cachol">לעצב את התפאורה שלך מחדש ולהתייפות בטאצ' של יופי</p>

<button class="text-barb bg-cachol hover:text-cachol hover:bg-white p-2 m-2" on:click={open}>אני רוצה</button>
</div>
{:else}
    <div class="pnimi bg-barb  text-center p-4 m-4">
        <h1 class="text-white">תודה רבה
            {$form.name}
            !
           <br>
            ניצור קשר בהקדם</h1>
    </div>
{/if}
</div>

<style>
    .body{
    height: 100vh;
    width: 100vw;
    background-image: url(https://res.cloudinary.com/barb1/image/upload/v1641753064/Wool_sxs0cp.svg);
    background-position: center center;
    background-size: cover;
    background-repeat: repeat;
    display: grid;
    justify-content: center;
    align-items: center;
    }
    .tofes{
         display: grid;
    justify-content: center;
    align-items: center;
    }
</style> 
