<script>
  import { DialogOverlay, DialogContent } from 'svelte-accessible-dialog';
 import { createForm } from "svelte-forms-lib";
    import * as yup from "yup";
  let isOpen;

  const open = () => {
    isOpen = true;
  };

  const close = () => {
    isOpen = false;
  };

  
  
   

    const { form, errors, state, handleChange, handleSubmit } = createForm({
      initialValues: {
        name: "",
        email: ""
      },
      validationSchema: yup.object().shape({
        title: yup
          .string()
          .oneOf(["Mr.", "Mrs.", "Mx."])
          .required(),
        name: yup.string().required(),
        email: yup
          .string()
          .email()
          .required()
      }),
      onSubmit: values => {
        alert(JSON.stringify(values));
      }
    });
  </script>

 




<DialogOverlay {isOpen} onDismiss={close}>
  <DialogContent aria-label="form">
    <button on:click={close}>סגור</button>
<h1 class="text-barb text-center">השארת פרטים לקניית רקמה</h1>
 <form on:submit={handleSubmit}>
    <label for="title">title</label>
    <select
      id="title"
      name="title"
      on:change={handleChange}
      bind:value={$form.title}>
      <option />
      <option>Mr.</option>
      <option>Mrs.</option>
      <option>Mx.</option>
    </select>
    {#if $errors.title}
      <small>{$errors.title}</small>
    {/if}

    <label for="name">name</label>
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

    <label for="email">email</label>
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

    <button type="submit">submit</button>
  </form>
</DialogContent>
</DialogOverlay>

<div class="body" >
    <div class="pnimi bg-barb  text-center p-4 m-4">
<h1 class="text-white text-xl text-center">קעקועים רקומים</h1>
<p class="text-center text-sm text-cachol">לעצב את התפאורה שלך מחדש ולגעת בטאצ' של יופי</p>

<button class="text-barb bg-cachol hover:text-cachol hover:bg-white p-2 m-2" on:click={open}>אני רוצה</button>
</div>
</div>

<style>
    .body{
    height: 100vh;
    width: 100vw;
    background-image: url(wool.svg);
    background-position: center center;
    background-size: cover;
    background-repeat: repeat;
    display: grid;
    justify-content: center;
    align-items: center;
    }
</style> 
