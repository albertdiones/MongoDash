let x = 0;

const count = () => {
    if (x>10) {
        return;
    }
    console.log(x++);
    Bun.sleep(1000).then(count);
}

count();