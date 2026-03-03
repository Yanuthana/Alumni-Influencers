<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <?php if($this->session->flashdata('success')): ?>
        <div style="color: green;">
            <?php echo $this->session->flashdata('success'); ?>
        </div>
    <?php endif; ?>

    <?php if($this->session->flashdata('error')): ?>
        <div style="color: red;">
            <?php echo $this->session->flashdata('error'); ?>
        </div>
    <?php endif; ?>

    <form action="<?php echo base_url('Login/login'); ?>" method="post">
        <h1>Login</h1>
        <label for="email">Email</label>
        <input type="text" name="email" placeholder="Email">
        <br>
        <br>
        <label for="password">Password</label>
        <input type="password" name="password" placeholder="Password">
        <br>
        <br>
        <button type="submit">Login</button>
    </form>
</body>
</html>